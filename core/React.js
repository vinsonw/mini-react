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
  wipRoot = {
    dom: container,
    props: {
      children: [vdom],
    },
  }

  // save initial work
  nextWorkOfUnit = wipRoot
}

let wipRoot = null // work-in-progress root
let currentRoot = null
let nextWorkOfUnit = null
let deletions = []
function workLoop(deadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }

  // append dom at once
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot(wipRoot)
  }

  requestIdleCallback(workLoop)
}

function commitRoot() {
  deletions.forEach(commitDeletion)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
  deletions = []
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent
    }
    fiberParent.dom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child)
  }
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
  // for each prop, we should consider:
  // 1.  it exists in prevProps, not in nextProps
  Object.keys(prevProps).forEach((key) => {
    // console.log("key", key)
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key)
      }
    }
  })

  // 2. it exists in nextProps, may exist or may not exist in prevProps
  Object.keys(nextProps).forEach((key) => {
    // console.log("key", key)
    if (key !== "children") {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase()
        // when update, first remove previous listener then bind
        dom.removeEventListener(eventType, prevProps[key])
        dom.addEventListener(eventType, nextProps[key])
      } else {
        dom[key] = nextProps[key]
      }
    }
  })
}

function reconcileChildren(fiber, children) {
  // note: remember we are dealing with the children of the fiber and not the fiber itself
  // note: the child in `children` here is vdom, not fiber, new fiber is created based on this vdom
  let prevChild = null
  let oldFiber = fiber.alternate?.child

  // 3. 转换链表，设置好指针
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type

    let newFiber
    if (isSameType) {
      // update
      newFiber = {
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
      // old fiber is not there or new fiber is not the same type as old fiber

      // child could be falsy values like false/null etc
      //to signal that it should not be rendered, thus not creating fiber for these children
      if (child) {
        newFiber = {
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
        // exclude no oldFiber case
        deletions.push(oldFiber)
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }
    prevChild = newFiber
  })

  // if oldFiber still has trusy value here, it means the oldFiber is an extra old sibling and there is no counterpart newFiber to it
  // so collect it for deletion
  while (oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    // 1. 创建dom
    const dom = createDom(fiber.type)
    fiber.dom = dom

    // 2. 处理props
    updateProps(fiber.dom, fiber.props, {})

    // moved to commitRoot()
    // fiber.parent.dom.append(dom)
  }

  const children = fiber.props?.children
  // console.log("[children", children, fiber.type)
  reconcileChildren(fiber, children)
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function"

  // 1. 创建dom
  // 2. 处理props
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
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  }

  nextWorkOfUnit = wipRoot
}

const React = {
  render,
  createElement,
  update,
}

export default React
