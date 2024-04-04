import React from "../core/React.js"

let showBar = false
const Bar = () => <div>bar</div>
const Foo = () => <p>foo</p>
function Counter() {
  const handleShowBar = () => {
    showBar = !showBar
    React.update()
  }

  return (
    <div>
      <button onClick={handleShowBar}>toggle</button>
      <div>{showBar ? <Bar /> : <Foo />}</div>
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
