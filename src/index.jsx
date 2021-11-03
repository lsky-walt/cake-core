import React from "react"
import {
  obtain,
  isFunc,
  isArray,
  isEmpty,
  addEventListener,
  isObject,
} from "@lsky/tools"
import {
  transformToProps,
  fetchData,
  getValueByKeys,
  getNodeByKeys,
} from "@lsky/cake-util"
import Container from "./components/container"
import Image from "./components/image"
import Text from "./components/text"

const ComponentMap = {
  Container,
  Image,
  Text,
}

export { transformToProps, getValueByKeys, getNodeByKeys }

// 每个node字段
// node: {
//   key: String,
//   title: String,
//   _props: Array,
//   children: Array,
//   value: string | number | boolean,
//   type: fetch | static | style | string,  类型， TODO: type === undefined 则为修改；type = fetch 表示请求； type = style, 将会组成一个集合 style； type = static 表示静态数据，value值将有服务端生成，不展示在cake中； type 是其他，则代表组件或者html tag
//   propsName: String,  // 指定 propsName，便于替换
//   requestData: object, // fetch 返回的数据
//   payload: stringFormat | query | data, // stringFormat => 使用 string-format 格式化，详见：string-format； query => url query； data => request data
//   options: {},   // 请参照 axios 请求参数，该参数仅用于 type = fetch
//   path: String,    // 请注意：此字段用于服务端，表示相对于根路径，文件路径，将会根据匹配值替换
//   match: String,   // 请注意：该字段用于服务端，表示匹配参数
// }

const updateFetchDataToNode = (fd, pos, nodes) => {
  if (isEmpty(nodes) || isEmpty(pos)) return nodes
  const position = pos.split("-")
  let p = position.shift()
  let r = nodes
  while (!isEmpty(position)) {
    p = +position.shift()
    r = r[p]
    if (!isEmpty(position)) {
      r = r.children
    }
  }

  if (
    obtain(r, "type") === "fetch" ||
    obtain(r, "_props", []).find((v) => v.type === "fetch")
  ) {
    r.requestData = fd
  }
  return nodes
}

function MapNode({ data }) {
  return data
    .filter(
      (node) =>
        // 所有 type 不为空，或者是 type 不等于 fetch 和 style
        obtain(node, "type", "fetch") !== "fetch" &&
        obtain(node, "type", "fetch") !== "style"
    )
    .map((node) => <GenerateNode key={node.key} data={node} />)
}

// 生成 render
function GenerateNode({ data }) {
  let Render = ComponentMap[data.type]
  let props = transformToProps(data)
  if (obtain(data, "type", "fetch") === "fetch") {
    Render = React.Fragment
    props = {}
  }
  // 如果 Render 为空，则统一用 Container
  if (!Render) {
    Render = Container
  }
  const child = [obtain(data, "value", null)]

  if (obtain(props, "children")) {
    const { children, ...p } = props
    props = p
    child.push(children)
  }

  if (!isEmpty(data.children) && isEmpty(obtain(props, "children"))) {
    child.push(<MapNode key="children_node" data={data.children} />)
  }

  return (
    <Render key={data.key} {...props}>
      {child}
    </Render>
  )
}

// 拥有 createNode
export function CreateNode({ data }) {
  if (isEmpty(data)) {
    return null
  }
  if (isArray(data)) {
    return <MapNode data={data} />
  }
  if (isObject(data)) {
    return <GenerateNode key={data.key} data={data} />
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
        const { options } = event.data
        if (options && !isEmpty(options)) {
          fetchData(options)
            .then((res) => {
              const d = updateFetchDataToNode(
                res.data,
                options.pos,
                event.data.data
              )
              this.setState({ data: d })
            })
            .catch((err) => {
              this.setState({ data: event.data.data })
            })
          return
        }
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
