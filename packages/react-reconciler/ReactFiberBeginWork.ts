import { shouldSetTextContent } from './ReactFiberHostConfig'
import {
  cloneChildFibers,
  mountChildFibers,
  reconcileChildFibers,
} from './ReactChildFiber'
import { bailoutHooks, renderWithHooks } from './ReactFiberHooks'
import { Fiber } from './ReactInternalTypes'
import { cloneUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
  MemoComponent,
  SimpleMemoComponent,
} from './ReactWorkTags'
import { includesSomeLane, Lanes, NoLanes } from './ReactFiberLane'
import { ContentReset } from './ReactFiberFlags'
import {
  createFiberFromTypeAndProps,
  createWorkInProgress,
  isSimpleFunctionComponent,
} from './ReactFiber'
import { shallowEqual } from '../shared/shallowEqual'

let didReceiveUpdate = false

const updateFunctionComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: Function,
  nextProps: any,
  renderLanes: Lanes
): Fiber | null => {
  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component as any,
    nextProps,
    null,
    renderLanes
  )

  if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes)
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)
  return workInProgress.child
}

/**
 * 优化路径，该fiber节点没有要进行的工作，看看他的子树有没有工作要做，如果
 * 有就返回子节点继续子节点的render过程，如果没有就直接返回null,此时以workInProgress
 * 为根的fiber子树的render过程就直接完成了
 * @param current
 * @param workInProgress
 * @param renderLanes 此次render的优先级
 * @returns
 */
const bailoutOnAlreadyFinishedWork = (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null => {
  //检查该节点的children是否存在待进行的工作
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
    /**
     * children也没有待进行的工作，我们可以直接跳过他们的render工作
     */
    return null
  }

  //该节点没有工作，但是他的子节点有，从current Fiber树中克隆他的子节点，然后继续
  cloneChildFibers(current, workInProgress)
  return workInProgress.child
}

/**
 * 更新HostRoot节点，此函数只会在首次渲染时使用
 * 其他情况下HostRoot走的都是bailout逻辑
 * @param current
 * @param workInProgress
 * @returns
 */
const updateHostRoot = (
  current: Fiber,
  workInProgress: Fiber,
  renderLanes: Lanes
) => {
  cloneUpdateQueue(current, workInProgress)
  //当第一次mount时payload为 {element: jsx对象}
  const prevState = workInProgress.memoizedState
  const prevChildren = prevState !== null ? prevState.element : null
  //HostRoot的pendingProps为null
  const nextProps = workInProgress.pendingProps
  processUpdateQueue(workInProgress, nextProps, null)
  const nextState = workInProgress.memoizedState

  const nextChildren = nextState.element

  if (nextChildren === prevChildren) {
    //todo 前后jsx对象没有变
    return null
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)

  return workInProgress.child
}

const reconcileChildren = (
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) => {
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes
    )
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes
    )
  }
}

/**
 * 因为函数组件的fiber在创建时会被赋值为IndeterminateComponent
 * 所以首次渲染时Function组件会走这个逻辑
 * 详细逻辑可以看 react-reconciler\ReactFiber.ts下的
 * createFiberFromTypeAndProps函数
 * @param current
 * @param workInProgress
 * @param Component 函数组件
 * @param renderLanes
 * @returns
 */
const mountIndeterminateComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  renderLanes: Lanes
): Fiber | null => {
  const props = workInProgress.pendingProps
  //value为该Function Component返回的JSX对象
  const value = renderWithHooks(
    current,
    workInProgress,
    Component,
    props,
    null,
    renderLanes
  )

  workInProgress.tag = FunctionComponent
  reconcileChildren(null, workInProgress, value, renderLanes)

  return workInProgress.child
}

const updateHostComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) => {
  const type = workInProgress.type
  const nextProps = workInProgress.pendingProps
  const prevProps = current !== null ? current.memoizedProps : null

  let nextChildren = nextProps.children
  //子节点是否可以直接设置成字符串而不用继续reconcile
  const isDirectTextChild = shouldSetTextContent(type, nextProps)

  if (isDirectTextChild) {
    /**
     * 我们把子节点为文本这种情况特别处理，这是一种非常常见的情况
     * 在这不会为该文本创建实际的fiber节点而是只把他放到props.children
     * 待会更新props时会直接setTextContent把他设置到dom上，以避免还要创建
     * 一个fiber节点，并遍历他
     * 注意只有<div>sdfsd dsfsd</div>，或者 <div>{1}</div>这种才算时
     * 直接文本子节点<div>{1}{2}</div>这种children类型是数组其中1，和2都会
     * 创建一个fiber节点与之对应，更多例子可以上[https://babeljs.io/repl/]
     * 自行把玩
     */
    nextChildren = null
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    /**
     * 此次更新时，当前需要被替换的节点一个单纯的文本节点，他没有对应的fiber节点
     * 所以不能靠reconcile过程把他删除，所以我们在这直接把他的父节点打上ContentReset
     * 标签待会commit阶段的时候它会被`textContent = ''`删除，这样他就能正常的被新内容替换，否则他将不会被清除一直存在在
     * 他的父节点上
     */
    workInProgress.flags |= ContentReset
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)
  return workInProgress.child
}

const updateSimpleMemoComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  updateLanes: Lanes,
  renderLanes: Lanes
): null | Fiber => {
  if (current !== null) {
    const prevProps = current.memoizedProps

    if (shallowEqual(prevProps, nextProps)) {
      didReceiveUpdate = false
      if (!includesSomeLane(renderLanes, updateLanes)) {
        //在beginWork中workInProgress pending中的lanes会被置为
        //NoLanes，进入该逻辑表明，这轮render以workInProgress为根的子树没有工作要做
        //但是可能他下一轮render可能有工作要做，
        //为了保证它pending中的工作能在下一轮render中，能被正常的执行
        //需要在这里将他current节点里的lanes赋值给workInProgress，以确保他待会
        //他pending中的lanes会在completeWork中被冒泡到root上
        /**
         * 考虑以下代码
         * let hasDispatched = false
         * const Foo = memo(() => {
         *   const [list, setList] = useState<number[]>([])
         *
         *   setTimeout(() => {
         *     if (hasDispatched) return
         *
         *     hasDispatched = true
         *     setList(Array.from({ length: 1e4 }, (_, i) => i))
         *   }, 1000)
         *
         *   return (
         *     <div>
         *       {list.map((v) => (
         *         <div>{v}</div>
         *       ))}
         *     </div>
         *   )
         * })
         *
         * const App = () => {
         *   const [count, setCount] = useState(0)
         *
         *   useEffect(() => {
         *     setTimeout(() => {
         *       const dispatcher = document.getElementById('dispatcher')
         *       dispatcher?.click()
         *     }, 1030)
         *   }, [])
         *   return (
         *     <div>
         *       <button
         *         id="dispatcher"
         *         onClick={() => {
         *           setCount(1)
         *         }}
         *       >
         *         {count}
         *       </button>
         *       <Foo />
         *     </div>
         *   )
         * }
         * 当进行Foo组件的渲染时，它会被App组件内产生的更高的优先级的更新打断，
         * 所以会先开始以renderLanes为1开始一轮更新，而此时Foo组件的UpdateLanes为
         * 16,如果没有memo组件的情况下他不会提前bailout,而会继续render过程
         * 在执行updateReducer时处理他updateQueue上因优先级不足而被跳过的update而被打上相应的lanes
         * 而现在他被包在memo里面所以他会进入这里的逻辑，
         * 而我们在这里提前进行bailout就得手动设置他workInProgress上的lanes
         * 如果我们运行上面的代码，并且没有下面这行的代码的话，Foo组件内产生的更新就会好像消失了一样
         */
        workInProgress.lanes = current.lanes
        return bailoutOnAlreadyFinishedWork(
          current,
          workInProgress,
          renderLanes
        )
      }
    }
  }

  return updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps,
    renderLanes
  )
}

const updateMemoComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  updateLanes: Lanes,
  renderLanes: Lanes
): null | Fiber => {
  if (current === null) {
    const type = Component.type
    if (
      isSimpleFunctionComponent(type) &&
      Component.compare === null &&
      Component.defaultProps === undefined
    ) {
      let resolvedType = type

      workInProgress.tag = SimpleMemoComponent
      workInProgress.type = resolvedType

      return updateSimpleMemoComponent(
        current,
        workInProgress,
        resolvedType,
        nextProps,
        updateLanes,
        renderLanes
      )
    }

    const child = createFiberFromTypeAndProps(
      Component.type,
      null,
      nextProps,
      workInProgress.mode,
      renderLanes
    )

    child.return = workInProgress
    workInProgress.child = child
    return child
  }

  const currentChild = current.child as Fiber

  if (!includesSomeLane(updateLanes, renderLanes)) {
    const prevProps = currentChild.memoizedProps
    let compare = Component.compare
    compare = compare !== null ? compare : shallowEqual
    if (compare(prevProps, nextProps)) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    }
  }

  const newChild = createWorkInProgress(currentChild, nextProps)
  newChild.return = workInProgress
  workInProgress.child = newChild

  return newChild
}

/**
 * 传入当前Fiber节点，创建子Fiber节点
 * @param current 当前节点
 * @param workInProgress workInProgress节点
 * @returns 下一个要进行beginWork的节点
 */
export const beginWork = (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null => {
  const updateLanes = workInProgress.lanes

  //当页面第一次渲染时current fiber树除了HostRoot(也就是FiberRoot.current)节点其他都还未创建,
  //workInPgress树中的HostRoot(FiberRoot.current.alternate)也在prepareFreshStack函数中被创建
  if (current !== null) {
    const oldProps = current.memoizedProps
    const newProps = workInProgress.pendingProps

    if (oldProps !== newProps) {
      //如果props改变了标记这个fiber需要进行工作
      didReceiveUpdate = true
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      didReceiveUpdate = false
      //这个fiber没有要进行的工作，执行其bailout逻辑，而不用继续
      //begin他的阶段
      switch (workInProgress.tag) {
        case HostRoot:
          break
        case HostComponent:
          break
        case HostText:
          break
        case FunctionComponent:
          break
        case SimpleMemoComponent:
          break
        default: {
          throw new Error('Not Implement')
        }
      }

      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    }
  } else {
    //current不存在
    didReceiveUpdate = false
  }

  //在进入begin流程前，先清除workInProgress pending中的lanes，否则会导致HostRoot不能进入bailout逻辑，
  //导致后续的更新不会触发，还会导致root上的pendingLanes一直不为空
  //会让performConcurrentWorkOnRoot一直被schedule下去
  workInProgress.lanes = NoLanes

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      //在mount时FunctionComponent是按indeterminate处理的
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes
      )
    }
    case FunctionComponent: {
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps = unresolvedProps
      return updateFunctionComponent(
        current!,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      )
    }
    case HostRoot: {
      //HostRoot类型current,workInProgress一定会同时存在
      return updateHostRoot(current!, workInProgress, renderLanes)
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes)
    case HostText:
      return null
    case MemoComponent: {
      const type = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps

      return updateMemoComponent(
        current,
        workInProgress,
        type,
        unresolvedProps,
        updateLanes,
        renderLanes
      )
    }
    case SimpleMemoComponent: {
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        updateLanes,
        renderLanes
      )
    }
  }

  throw new Error('Not Implement')
}

export const markWorkInProgressReceivedUpdate = () => {
  didReceiveUpdate = true
}
