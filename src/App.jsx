import React from "../core/React.js"

let num = 123
let props = {
  style: "color: red",
}
function Counter() {
  const handleClick = () => {
    console.log("counter is clicked!")
    num++
    // props = { style: `color: ${num % 2 === 0 ? "blue" : "red"}` }
    props = {}
    React.update()
  }

  return (
    <div {...props}>
      <button onClick={handleClick}>inc</button>
      counter {num}
    </div>
  )
}

function ChildOfCounter({ num }) {
  return (
    <div>
      <div>ChildOfCounter: num: {num}</div>
    </div>
  )
}

function AnotherCounter() {
  return <div>another counter</div>
}

const App = () => (
  <div id="app">
    app mini-react
    <Counter />
    {/* <AnotherCounter /> */}
  </div>
)

export default App
