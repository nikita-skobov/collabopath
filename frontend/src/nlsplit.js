import React from 'react'

const nlsplit = (text) => {
  const arr = text.split('\n')
  return arr.map((item, key) => (
    <span key={key}>{item}<br /></span>
  ))
}

export default nlsplit
