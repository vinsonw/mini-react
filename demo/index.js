let taskId = 1
function workLoop(deadline) {
  taskId++
  console.log('remaining time', deadline.timeRemaining())

  let shouldYield = false
  while (!shouldYield) {
    // run task
    console.log('taskId', taskId)
    // if (taskId > 100) break
    shouldYield = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

requestIdleCallback((deadline)=>{
    console.log(deadline.timeRemaining(), deadline.didTimeout)
});