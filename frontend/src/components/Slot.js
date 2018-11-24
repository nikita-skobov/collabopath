import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Transition } from 'semantic-ui-react'
import { Slot as slotVars } from '../dynamicVars'

export default class Slot extends Component {
  constructor(props) {
    // console.log('CONSTRUCTING SLOT')
    super(props)
    this.state = {
      num: 0,
      visible: true,
    }

    this.min = props.min
    this.max = props.max
    this.callback = props.callback
    this.animation = props.animation
    this.transitionDuration = props.transitionDuration

    this.changeNumber = this.changeNumber.bind(this)
    this.startSpin = this.startSpin.bind(this)
    this.onHideInner = this.onHideInner.bind(this)

    this.spinSpeed = props.spinSpeed || slotVars.initialSpinSpeed
    this.spinFactor = props.spinFactor || slotVars.spinFactor
    this.stopSpinThreshold = props.stopSpinThreshold || slotVars.stopSpinThreshold
    this.spinning = true

    setTimeout(() => {
      this.startSpin()
    }, this.spinSpeed)
  }

  onHideInner() {
    // console.log('done transitioning')
    const { num } = this.state
    this.callback(null, num)
  }

  startSpin() {
    const { spinning, animation } = this
    if (spinning) {
      this.spinSpeed += ((this.spinSpeed * this.spinFactor))
      this.changeNumber()
      setTimeout(() => this.startSpin(), this.spinSpeed)
      if (this.spinSpeed > this.stopSpinThreshold) this.spinning = false
    } else if (animation) {
      this.setState({ visible: false })
    } else {
      this.onHideInner()
    }
  }

  changeNumber() {
    const n = Math.floor(Math.random() * (this.max - this.min + 1) + this.min)
    this.setState({ num: n })
  }

  render() {
    const { num, visible } = this.state
    if (this.animation) {
      return (
        <Transition onHide={this.onHideInner} animation="fly down" visible={visible} duration={this.transitionDuration}>
          <div>
            {num}
          </div>
        </Transition>
      )
    }
    return (
      <div>
        {num}
      </div>
    )
  }
}

Slot.defaultProps = {
  animation: false,
  spinSpeed: null,
  spinFactor: null,
  stopSpinThreshold: null,
  transitionDuration: 800,
}

Slot.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
  transitionDuration: PropTypes.number,
  animation: PropTypes.bool,
  spinSpeed: PropTypes.number,
  spinFactor: PropTypes.number,
  stopSpinThreshold: PropTypes.number,
}
