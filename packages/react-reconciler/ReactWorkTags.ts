export type WorkTag =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24

export const FunctionComponent = 0

/**
 * FiberRoot.current
 */
export const HostRoot = 3 // Root of a host tree. Could be nested inside another node.
/**
 * 文字节点
 */
export const HostText = 6;
/**
 * 在每经过reconcile之前class和function都是该类组件
 */
export const IndeterminateComponent = 2; // Before we know whether it is function or class
export const ClassComponent = 1;
/**
 * div span之类的组件
 */
export const HostComponent = 5;

