import React from "react"

// 容器组件
export default function Container({ children, ...attr }) {
  return <div {...attr}>{children}</div>
}
