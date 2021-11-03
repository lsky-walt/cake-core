import React from "react"

// 文本
export default function Text({ children, ...attr }) {
  return <p {...attr}>{children}</p>
}
