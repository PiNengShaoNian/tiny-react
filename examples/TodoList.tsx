/**
 * 简单的代办应用
 */
import { CSSProperties } from 'react'
import React, { useEffect } from '../packages/react'
import { useState } from '../packages/react'

type TodoItem = {
  label: string
  status: boolean
}

export const TodoList = () => {
  const [todoList, setTodoList] = useState<TodoItem[]>([])
  const [todo, setTodo] = useState<string>('')

  useEffect(() => {
    console.log(todo)
  }, [todo])

  const handleCompleteClick = (index: number) => {
    const next = [...todoList]
    todoList[index] = {
      ...todoList[index],
      status: true,
    }

    setTodoList(next)
  }

  const handleDeleteClick = (index: number) => {
    const next: TodoItem[] = [...todoList]

    console.log({ index })

    next.splice(index, 1)
    setTodoList(next)
  }

  useEffect(() => {
    console.log(todoList)
  }, [todoList.length])

  return (
    <div>
      <input
        value={todo}
        onKeyDown={(e) => {
          if (
            e.nativeEvent.key === 'Enter' &&
            todo &&
            !todoList.find((v) => v.label === todo)
          ) {
            setTodoList([
              ...todoList,
              {
                status: false,
                label: todo,
              },
            ])
            setTodo('')
          }
        }}
        onChange={(e) => {
          setTodo(e.target.value)
        }}
      />
      <ul style={styles.listContainer}>
        {todoList.map((v, i) => (
          <li
            style={
              v.status === true ? styles.completedTodoItem : styles.todoItem
            }
            key={v.label}
          >
            <div>{v.label}</div>
            <div>
              <button onClick={() => handleCompleteClick(i)}>完成</button>
              <button onClick={() => handleDeleteClick(i)}>删除</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const baseTodoItemStyle: CSSProperties = {
  height: 30,
  background: 'indigo',
  margin: 0,
  padding: 0,
  marginBottom: 5,
  color: '#fff',
  listStyle: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const completedTodoItemStyle: CSSProperties = {
  ...baseTodoItemStyle,
  background: 'red',
}

const styles: Record<
  'todoItem' | 'listContainer' | 'completedTodoItem',
  CSSProperties
> = {
  listContainer: {
    margin: 0,
    padding: 0,
  },
  todoItem: baseTodoItemStyle,
  completedTodoItem: completedTodoItemStyle,
}
