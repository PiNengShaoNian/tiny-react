/**
 * 简单的代办应用
 */
import React, { useEffect } from '../packages/react'
import { useState } from '../packages/react'

export const TodoList = () => {
  const [todoList, setTodoList] = useState([])
  const [todo, setTodo] = useState<string>('')

  useEffect(() => {
    console.log(todo)
  }, [todo])

  return (
    <div>
      <input
        value={todo}
        onChange={(e) => {
          console.log(e.target.value)
        //   setTodo(todo)
        //   setTodo(e.target.value)
        }}
      />
    </div>
  )
}
