import React from "../core/React.js"

/**
 * 19: impl useState()
 */

const App = () => {
  const [count, setCount] = React.useState(1)
  const [bar, setBar] = React.useState(10)
  const handleClick = () => {
    setCount((count) => count + 1)
    setBar((count) => count + 1)
  }
  return (
    <div id="app">
      <button onClick={handleClick}>app inc</button>
      app mini-react
      <p>count {count}</p>
      <p>bar {bar}</p>
    </div>
  )
}

export default App
