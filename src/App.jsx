import React from "../core/React.js"

/**
 * 19: impl useState()
 */

const App = () => {
  const [count, setCount] = React.useState(1)
  const [bar, setBar] = React.useState(10)
  console.log("App re-runs")
  const handleClick = () => {
    setCount((count) => count + 1)
    setBar("bar")
  }

  React.useEffect(() => {
    console.log("init")
  }, [])

  React.useEffect(() => {
    console.log("update")
  }, [count])

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
