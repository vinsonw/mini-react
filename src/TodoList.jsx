import React from "../core/React.js"
import "../style.css"

export default function TodoList() {
  const [todoList, setTodoList] = React.useState([])
  const [filter, setFilter] = React.useState("all")
  const [filteredTodoList, setFilteredTodoList] = React.useState([])
  const [inputValue, setInputValue] = React.useState("")

  React.useEffect(() => {
    const rawTodoList = localStorage.getItem("todoList")
    if (rawTodoList) {
      console.log("rawTodoList", rawTodoList)
      setTodoList(JSON.parse(rawTodoList))
    }
  }, [])

  React.useEffect(() => {
    // console.log("filter", filter)
    setFilteredTodoList(
      filter === "all"
        ? todoList
        : todoList.filter((todo) => todo.status === filter)
    )
  }, [filter, todoList])

  const addTodo = (title) =>
    setTodoList((todoList) => [
      ...todoList,
      { title, id: crypto.randomUUID(), status: "active" },
    ])

  const handleAdd = () => {
    addTodo(inputValue)
    setInputValue("")
  }

  const handleRemove = (id) => {
    setTodoList((todoList) => todoList.filter((todo) => todo.id !== id))
  }

  const handleDone = (id) => {
    setTodoList((todoList) =>
      todoList.map((todo) =>
        todo.id === id ? { ...todo, status: "done" } : todo
      )
    )
  }

  const handleCancel = (id) => {
    setTodoList((todoList) =>
      todoList.map((todo) =>
        todo.id === id ? { ...todo, status: "active" } : todo
      )
    )
  }

  const handleSave = () => {
    localStorage.setItem("todoList", JSON.stringify(todoList))
  }
  return (
    <div>
      <h2>Todos</h2>
      <div className="header">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleAdd}>add</button>
        <button onClick={handleSave}>save</button>
        <p>
          <input
            type="radio"
            name="filter"
            id="all"
            checked={filter === "all"}
            onChange={() => setFilter("all")}
          />
          <label htmlFor="all">all</label>
          <input
            type="radio"
            name="filter"
            id="done"
            checked={filter === "done"}
            onChange={() => setFilter("done")}
          />
          <label htmlFor="done">done</label>
          <input
            type="radio"
            name="filter"
            id="active"
            checked={filter === "active"}
            onChange={() => setFilter("active")}
          />
          <label htmlFor="active">active</label>
        </p>
      </div>
      <ul>
        {...filteredTodoList.map((todo) => (
          <TodoItem
            todo={todo}
            handleAdd={handleAdd}
            handleRemove={handleRemove}
            handleDone={handleDone}
            handleCancel={handleCancel}
          />
        ))}
      </ul>
    </div>
  )
}

function TodoItem({ todo, handleAdd, handleRemove, handleDone, handleCancel }) {
  return (
    <li>
      <span className={todo.status}>{todo.title}</span>
      <button onClick={() => handleRemove(todo.id)}>remove</button>
      {todo.status === "done" ? (
        <button onClick={() => handleCancel(todo.id)}>cancel</button>
      ) : (
        <button onClick={() => handleDone(todo.id)}>done</button>
      )}
    </li>
  )
}
