import React from "../core/React.js"

let showBar = false
const Bar = <div id={"bar"}>bar</div>
const Foo = (
  <div id={"foo"}>
    foo
    <div>foo child 1</div>
    <div>foo child 2</div>
  </div>
)

function Counter() {
  const handleShowBar = () => {
    showBar = !showBar
    React.update()
  }

  return (
    <div>
      <button onClick={handleShowBar}>toggle</button>
      <div>{showBar && Bar}</div>
      <div>counter bottom</div>
    </div>
  )
}

const App = () => (
  <div id="app">
    app mini-react
    <Counter />
  </div>
)

export default App
