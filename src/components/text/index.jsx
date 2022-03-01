import React from "react"

// 文本
export default function Text({ text, ...attr }) {
  return <p {...attr}>{text}</p>
}
