import { obtain, isArray, isEmpty } from "@lsky/tools"

// 每个node字段
// node: {
//   key: String,
//   title: String,
//   _props: Array,
//   children: Array,
//   value: string | number | boolean,
//   type: fetch | static | style | string,  类型， TODO: type === undefined 则为修改；type = fetch 表示请求； type = style, 将会组成一个集合 style； type = static 表示静态数据，value值将有服务端生成，不展示在cake中；
//   tag: string, // 代表组件或者html tag
//   propsName: String,  // 指定 propsName，便于替换
//   data: Array,   // select 数据？
//   target: color | select | textarea | image, // 渲染成什么样的组件  cake里使用
//   relative: key, //  跟哪个节点关联，仅限同级
//   description: string, //  描述
// }

const NodeKeys = [
  "key",
  "title",
  "_props",
  "type",
  "children",
  "value",
  "tag",
  "propsName",
  "data",
  "target",
  "relative",
  "description",
]

// postion map
// 各个节点的位置映射
// 用于修改节点数据时，索引位置
let posMap = new Map()

// ————————————————————————————————————————

const getValueFromNode = (node) => obtain(node, "value", node._props)

/**
 * 转换 node 的value
 * @param {object} node 节点
 * @returns props
 */
export const transformToProps = (node) => {
  let result = {}
  if (obtain(node, "ignoreTransformValue")) {
    result[obtain(node, "propsName", node.key)] = getValueFromNode(node)
    return result
  }
  // 两种情况
  // a. array
  // b. string | boolean | number
  if (isArray(getValueFromNode(node))) {
    getValueFromNode(node).forEach((n) => {
      if (n.type === "style") {
        const st = obtain(result, "style", {})
        st[obtain(n, "propsName", n.key)] = getValueFromNode(n)
        result.style = st
      } else {
        const { style, ...p } = transformToProps(n)
        // 是否存在 style
        result[obtain(n, "propsName", n.key)] = style
        result = { ...result, ...p }
      }
    })
  }

  if (!isArray(getValueFromNode(node))) {
    result[obtain(node, "propsName", node.key)] = getValueFromNode(node)
  }
  return result
}

// 生成 postion
export const loop = (data = [], prefix = "0", result = new Map()) => {
  if (!isArray(data)) {
    return result
  }
  data.forEach((n, index) => {
    const children = obtain(n, "children")
    const pos = `${prefix}-${index}`
    if (!isEmpty(children)) {
      result = loop(children, pos, result)
    }
    result.set(n.key, pos)
  })
  return result
}

export const genPosMap = (data) => {
  posMap = loop(data)
}

export const getPosByKey = (key) => posMap.get(key)

export function getNodeByKeys(key, data) {
  if (isEmpty(key) || isEmpty(data)) return null
  const keys = key.split(".")
  let d = data
  let k = null
  while (!isEmpty(keys)) {
    k = keys.shift()
    // eslint-disable-next-line no-loop-func
    const n = d && d.find((v) => v.key === k)
    d = n
    if (!isEmpty(keys)) {
      d = obtain(d, "children")
    }
  }

  if (obtain(d, "key") === k) {
    return d
  }
  return null
}

/**
 * 通过 key 获取 props
 * 注意：需要特殊处理 type = fetch
 * 注意：需要处理 propsName
 * @param {string} key key；ex: header.top.logoText
 * @param {array} data 数据
 * @param {object} defaultValue 默认值
 * @returns props
 */
export function getValueByKeys(key, data, defaultValue = {}) {
  if (isEmpty(key) || isEmpty(data)) return defaultValue
  const d = getNodeByKeys(key, data)
  if (!isEmpty(d)) {
    const result = transformToProps(d)
    return result
  }
  return {}
}

// -----------------------------------------------

// 将 value 更新到 node 里
export const updateValueToNode = (raw = [], pos, key = "value", tar) => {
  let r = raw

  const position = pos.split("-")
  // pos 第一个位置为 0
  let p = position.shift()

  while (!isEmpty(position)) {
    p = +position.shift()
    r = r[p]
    if (!isEmpty(position)) {
      r = r.value
    }
  }
  if (tar.key === obtain(r, "key")) {
    r[key] = tar.value
  }
  return raw
}

// 处理元数据，分为静态数据和可修改数据
export const handleRawData = (data) => {
  if (isEmpty(data)) return [null, null]
  const st = []
  const result = []
  data.forEach((node) => {
    if (node.type === "static") {
      st.push(node)
    } else {
      result.push(node)
    }
  })
  return [st, result]
}

export const mergeStaticToRaw = (st, data) => {
  if (isEmpty(st)) return data
  return [...st, ...data]
}
