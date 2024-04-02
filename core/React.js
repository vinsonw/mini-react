
function createElement(type, props, ...children) {
  console.log('createElement: hello')
  return {
    type,
    props: {
      ...props, 
      children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
    }
  }
}

function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  
}
}

function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }

  // save initial work
  root = nextWorkOfUnit
}

let root = null
let nextWorkOfUnit = null
function workLoop(deadline) {

  let shouldYield = false
  while (!shouldYield &&  nextWorkOfUnit) {
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
  fiber.parent.dom.append(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type) {
    return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}

function updateProps(dom, props) {
    Object.keys(props).forEach(key => {
      if (key !== 'children') {
        dom[key] = props[key]
      }
    })
}

function initChildren(work) {
  const children = work.props.children
  let prevChild = null
  children.forEach((child, index) => {
    const newFiler = {
      type: child.type,
      props: child.props,
      child: null,
      sibling: null,
      parent: work,
      dom: null
    }

    if (index === 0) {
      work.child = newFiler
    } else {
      prevChild.sibling = newFiler
    }
    prevChild = newFiler
  })
}

function performWorkOfUnit(fiber) {
  // 1. 创建dom
  if (!fiber.dom) {
    const dom = createDom(fiber.type)
    fiber.dom = dom
    // moved to commitRoot()
    // fiber.parent.dom.append(dom)
    // 2. 处理props
    updateProps(dom, fiber.props)

  }

  // 3. 转换链表，设置好指针
  initChildren(fiber)

  // 4. 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child
  }

  if (fiber.sibling) {
    return fiber.sibling
  }

  return fiber.parent?.sibling
}

requestIdleCallback(workLoop)

const React = {
  render,
  createElement,

}


export default React