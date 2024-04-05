import React from "../core/React.js"

/**
 * 18 优化更新: 减少不必要的计算
 * 开始: 当前需要更新的组件fiber 结束: 当需要处理当前组件兄弟fiber节点的时候
 */

let countFoo = 1
const Foo = () => {
  console.log("Foo runs")

  let update = React.update()
  const handleClick = () => {
    countFoo++
    update()
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
  const update = React.update()
  const handleClick = () => {
    countBar++
    update()
  }
  return (
    <div>
      <h2>bar</h2>
      {countBar}
      <button onClick={handleClick}>inc bar count</button>
    </div>
  )
}

let appCount = 1
const App = () => {
  const update = React.update()
  const handleClick = () => {
    appCount++
    update()
  }
  return (
    <div id="app">
      <button onClick={handleClick}>app inc</button>
      <h2>app count {appCount}</h2>
      app mini-react
      <Foo />
      <Bar />
    </div>
  )
}

export default App
