import React from "react"
import * as styles from './index.css'

export default function Image(props) {
  const { pcSrc, mobileSrc } = props

  return (
    <>
      { pcSrc && <img alt="default" src={pcSrc} className={styles.common_module_image_pc} /> }
      { mobileSrc && <img alt="default" src={mobileSrc} className={styles.common_module_image_mobile} /> }
    </>
  )
}
