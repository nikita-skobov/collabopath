import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Transition, Header } from 'semantic-ui-react'
import { Slot as slotVars, getFoundItem } from '../dynamicVars'

export default class FoundItemSlot extends Component {
  constructor(props) {
    super(props)

    this.callback = props.callback

    this.state = {
      visible: true,
      text: '',
    }

    this.transitionDuration = props.transitionDuration

    this.changeText = this.changeText.bind(this)
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
    const { text } = this.state
    this.callback(null, text)
  }

  startSpin() {
    const { spinning } = this
    if (spinning) {
      this.spinSpeed += ((this.spinSpeed * this.spinFactor))
      this.changeText()
      setTimeout(() => this.startSpin(), this.spinSpeed)
      if (this.spinSpeed > this.stopSpinThreshold) this.spinning = false
    } else {
      this.setState({ visible: false })
    }
  }

  changeText() {
    const itemName = getFoundItem()
    this.setState({ text: itemName })
  }

  render() {
    const { text, visible } = this.state
    return (
      <Transition onHide={this.onHideInner} animation="fly down" visible={visible} duration={this.transitionDuration}>
        <Header as="h3">
          {text}
        </Header>
      </Transition>
    )
  }
}

FoundItemSlot.defaultProps = {
  spinSpeed: null,
  spinFactor: null,
  stopSpinThreshold: null,
  transitionDuration: 800,
}

FoundItemSlot.propTypes = {
  callback: PropTypes.func.isRequired,
  transitionDuration: PropTypes.number,
  spinSpeed: PropTypes.number,
  spinFactor: PropTypes.number,
  stopSpinThreshold: PropTypes.number,
}
