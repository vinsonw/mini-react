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
let currentRoot = null
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
  }

  requestIdleCallback(workLoop)
}

function commitRoot() {
  commitWork(root.child)
  currentRoot = root
  root = null
}

function commitWork(fiber) {
  if (!fiber) return
  let fiberParent = fiber.parent
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if (fiber.effectTag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  } else if (fiber.effectTag === "placement") {
    // no dom for fiber of function component
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom)
    }
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type)
}

function updateProps(dom, nextProps, prevProps) {
  Object.keys(nextProps).forEach((key) => {
    console.log("key", key)
    if (key !== "children") {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase()
        dom.addEventListener(eventType, nextProps[key])
      } else {
        dom[key] = nextProps[key]
      }
    }
  })

  // to each prop, we should consider:
  // 1.  exists in prevProps, not in nextProps
  Object.keys(prevProps).forEach((key) => {
    // console.log("key", key)
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key)
      }
    }
  })

  // 2. exists in nextProps, may exist or may not exist in prevProps
  Object.keys(nextProps).forEach((key) => {
    // console.log("key", key)
    if (key !== "children") {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase()
        dom.addEventListener(eventType, nextProps[key])
      } else {
        dom[key] = nextProps[key]
      }
    }
  })
}

function initChildren(fiber, children) {
  // note: remember we are dealing with the children of the fiber and not the fiber itself
  let prevChild = null
  let oldFiber = fiber.alternate?.child

  // flat the children
  let newChildren = []
  children.forEach((child) => (newChildren = newChildren.concat(child)))

  newChildren.forEach((child, index) => {
    // note: the child here is vdom, not fiber, new fiber is created based on this vdom
    const isSameType = oldFiber && oldFiber.type === child.type

    let newFiler
    if (isSameType) {
      // update
      newFiler = {
        type: child.type,
        props: child.props,
        child: null,
        sibling: null,
        parent: fiber,
        dom: oldFiber.dom,
        effectTag: "update",
        alternate: oldFiber,
      }
    } else {
      // add
      newFiler = {
        type: child.type,
        props: child.props,
        child: null,
        sibling: null,
        parent: fiber,
        dom: null,
        effectTag: "placement",
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      fiber.child = newFiler
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
  }

  // 2. 处理props
  updateProps(fiber.dom, fiber.props, {})

  const children = fiber.props?.children
  // console.log("[children", children, fiber.type)
  initChildren(fiber, children)
}

function performWorkOfUnit(fiber) {
  // debugger
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

function update(vdom, container) {
  // debugger
  // console.log("vdom", vdom)
  nextWorkOfUnit = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  }
}

const React = {
  render,
  createElement,
  update,
}

export default React
