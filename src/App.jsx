import React from "../core/React.js"

let countFoo = 1
const Foo = () => {
  console.log("Foo runs")
  const handleClick = () => {
    countFoo++
    React.update()
  }
  return (
    <div>
      <h2>Foo</h2>
      {countFoo}
      <button onClick={handleClick}>inc bar count</button>
    </div>
  )
}

let countBar = 1
const Bar = () => {
  console.log("Bar runs")
  const handleClick = () => {
    countBar++
    React.update()
  }
  return (
    <div>
      <h2>bar</h2>
      {countBar}
      <button onClick={handleClick}>inc bar count</button>
    </div>
  )
}

const App = () => (
  <div id="app">
    app mini-react
    <Foo />
    <Bar />
  </div>
)

export default App
