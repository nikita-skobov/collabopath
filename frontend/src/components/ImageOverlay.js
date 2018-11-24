import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ImageOverlay extends Component {
  constructor(props) {
    super(props)
    this.src = props.src
    this.alt = props.alt
    this.children = props.children
    this.opacity = props.opacity
    this.maxWidth = props.maxWidth
    this.backgroundColor = props.backgroundColor


    this.overlayStyle = {
      position: 'absolute',
      top: '0',
      left: '0',
      height: '100%',
      width: '100%',
      opacity: `${this.opacity}`,
      backgroundColor: this.backgroundColor,
    }

    this.childStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  render() {
    return (
      <div
        style={{
          position: 'relative',
          width: this.maxWidth,
          paddingLeft: '0rem',
          paddingRight: '0rem',
        }}
      >
        <img src={this.src} style={{ width: '100%', display: 'block' }} alt={this.alt} />
        <div style={this.overlayStyle}>
          <div style={this.childStyle}>
            {this.children}
          </div>
        </div>
      </div>
    )
  }
}

ImageOverlay.defaultProps = {
  alt: 'Image could not be displayed',
  children: [],
  opacity: 0.5,
  maxWidth: '100%',
  backgroundColor: '#000',
}

ImageOverlay.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  children: PropTypes.instanceOf(Array),
  opacity: PropTypes.number,
  maxWidth: PropTypes.string,
  backgroundColor: PropTypes.string,
}
