import { isEmpty } from "@lsky/tools/lib/value"
import React from "react"

export default function Image(props) {
  if (isEmpty(props)) return null
  return <img alt="default" {...props} />
}
