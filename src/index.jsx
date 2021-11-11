import React from "react"
import {
  obtain,
  isFunc,
  isArray,
  isEmpty,
  addEventListener,
  isObject,
} from "@lsky/tools"
import { transformToProps, getValueByKeys, getNodeByKeys } from "./tools"
import Container from "./components/container"
import Image from "./components/image"
import Text from "./components/text"

const ComponentMap = {
  Container,
  Image,
  Text,
}

export { transformToProps, getValueByKeys, getNodeByKeys }

function MapNode({ data }) {
  return data.map((node) => <GeneNode key={node.key} data={node} />)
}

// 生成 render
// 通过 tag 映射组件
function GeneNode(props) {
  const data = obtain(props, "data")
  if (isEmpty(data)) return null
  let Render = ComponentMap[data.tag]
  let _props = transformToProps(data)
  // 如果 Render 为空，则统一用 Container
  if (!Render) {
    Render = Container
  }
  const child = []

  if (!isEmpty(obtain(data, "value", null))) {
    child.push(obtain(data, "value", null))
  }

  if (obtain(_props, "children")) {
    const { children, ...p } = _props
    _props = p
    child.push(children)
  }

  if (!isEmpty(data.children) && isEmpty(obtain(_props, "children"))) {
    child.push(<MapNode key="children_node" data={data.children} />)
  }
  if (isEmpty(child)) {
    return <Render key={data.key} {..._props} />
  }

  return (
    <Render key={data.key} {..._props}>
      {child}
    </Render>
  )
}

// 拥有 createNode
export function CreateNode(props) {
  const data = obtain(props, "data")
  if (isEmpty(data)) {
    return null
  }
  if (isArray(data)) {
    return <MapNode data={data} />
  }
  if (isObject(data)) {
    return <GeneNode key={data.key} data={data} />
  }
  return null
}

export class Init extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: props.data,
    }
  }

  componentDidMount() {
    const { data } = this.props
    if (typeof window !== "undefined") {
      this.pm = addEventListener(window, "message", (event) => {
        if (obtain(event.data, "type", null) !== "cake") return

        // data: {
        //   type: "cake",
        //   data: [Node]
        // }
        this.setState({
          data: event.data.data,
        })
      })

      if (window.parent) {
        window.parent.postMessage(
          {
            type: "raw",
            data,
          },
          "*"
        )
      }
    }
  }

  componentWillUnmount() {
    if (this.pm) {
      this.pm.remove()
    }
  }

  render() {
    const { data } = this.state
    const { children } = this.props
    if (isFunc(children)) {
      return children(data)
    }
    return children
  }
}
