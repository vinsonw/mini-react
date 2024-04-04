import React from "../core/React.js"

function Counter() {
  return (
    <div onClick={() => console.log("counter is clicked!")}>
      counter{" "}
      <ChildOfCounter num={123}>
        grandson of counter <div>granddaughter of counter</div>
      </ChildOfCounter>
    </div>
  )
}

function ChildOfCounter({ children, num }) {
  return (
    <div>
      <div>
        ChildOfCounter: children: {children} num: {num}
      </div>
      {children}
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
    <AnotherCounter />
  </div>
)

export default App
