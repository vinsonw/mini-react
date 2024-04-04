function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number"
        // console.log("typeof child", typeof child, child)
        return isTextNode ? createTextNode(child) : child
        // what the code does:
        // <div> hello {123} </div> ==(vite did this step)==> {type: 'div', props, children: [' hello ', 123]} ==(then .map())==> { type: 'div', props: {children: [ createTextNode('hello'), createTextNode(123) ]} }
      }),
    },
  }
}

function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function render(vdom, container) {
  // console.log("vdom", vdom)
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [vdom],
    },
  }

  // save initial work
  root = nextWorkOfUnit
}

let root = null
let nextWorkOfUnit = null
function workLoop(deadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }

  // append dom at once
  if (!nextWorkOfUnit && root) {
    commitRoot(root)
    root = null
  }

  requestIdleCallback(workLoop)
}

function commitRoot() {
  commitWork(root.child)
  root = null
}

function commitWork(fiber) {
  if (!fiber) return
  let fiberParent = fiber.parent
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }
  // no dom for fiber of function component
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type)
}

function updateProps(dom, props) {
  Object.keys(props).forEach((key) => {
    console.log("key", key)
    if (key !== "children") {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase()
        dom.addEventListener(eventType, props[key])
      } else {
        dom[key] = props[key]
      }
    }
  })
}

function initChildren(work, children) {
  // const children = work.props.children
  let prevChild = null

  // flat the children
  let newChildren = []
  children.forEach((child) => (newChildren = newChildren.concat(child)))

  newChildren.forEach((child, index) => {
    const newFiler = {
      type: child.type,
      props: child.props,
      child: null,
      sibling: null,
      parent: work,
      dom: null,
    }

    if (index === 0) {
      work.child = newFiler
    } else {
      prevChild.sibling = newFiler
    }
    prevChild = newFiler
  })
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  initChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    // 1. 创建dom
    const dom = createDom(fiber.type)
    fiber.dom = dom
    // moved to commitRoot()
    // fiber.parent.dom.append(dom)
    // 2. 处理props
    updateProps(dom, fiber.props)
  }

  const children = fiber.props?.children
  // console.log("[children", children, fiber.type)
  initChildren(fiber, children)
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function"

  // 3. 转换链表，设置好指针
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // 4. 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child
  }

  // first try to return sibling, if none, try to return uncle, if none, try to return granduncle, if none, try to return grand granduncle...
  // ...until there is no nextFiber and return undefined
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
}

requestIdleCallback(workLoop)

const React = {
  render,
  createElement,
}

export default React
