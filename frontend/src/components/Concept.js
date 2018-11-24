/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Modal, Step, Button, Header, Transition, Checkbox } from 'semantic-ui-react'

import { Concepts } from '../dynamicVars'

const has = Object.prototype.hasOwnProperty

export default class Concept extends Component {
  constructor(props) {
    super(props)
    this.type = props.type
    this.dataStore = props.dataStore

    this.transitionDuration = Concepts.transitionDuration
    this.data = Concepts[this.type]
    this.dontShow = false

    this.state = {
      active: 0,
      gotItButton: false,
      transitionVisible: true,
      transitionAnimation: 'fly left',
    }

    this.handleButton = this.handleButton.bind(this)
    this.handleCheckbox = this.handleCheckbox.bind(this)
    this.onHide = this.onHide.bind(this)
  }

  onHide() {
    const { transitionAnimation } = this.state
    if (transitionAnimation === 'fly right') {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.active += 1
        if (tempState.active === this.data.body.length - 1) {
          // we only want the next button to say 'Got It' when
          // the user is on the last body text
          tempState.gotItButton = true
        }
        tempState.transitionVisible = true
        tempState.transitionAnimation = 'fly left'
        return tempState
      })
    } else if (transitionAnimation === 'fly left') {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.active -= 1
        if (tempState.active !== this.data.body.length - 1) {
          // we only want the next button to say 'Got It' when
          // the user is on the last body text
          tempState.gotItButton = false
        }
        tempState.transitionVisible = true
        tempState.transitionAnimation = 'fly right'
        return tempState
      })
    }
  }

  handleButton(e) {
    e.preventDefault()
    const { name } = e.target
    if (name === 'close' || name === 'gotit') {
      if (this.dontShow) {
        this.dataStore.dontShowConcepts()
      }
      this.dataStore.tell('App').closeConceptModal()
    } else if (name === 'next') {
      this.setState({ transitionAnimation: 'fly right', transitionVisible: false })
    } else if (name === 'back') {
      this.setState({ transitionAnimation: 'fly left', transitionVisible: false })
    }
  }

  handleCheckbox(e, d) {
    e.preventDefault()
    // if the box is checked, then the user Does NOT
    // want to be shown the modals again, so dontShow is true
    this.dontShow = d.checked
  }

  render() {
    let { active, gotItButton, transitionAnimation, transitionVisible } = this.state
    if (this.data.body.length === 1) gotItButton = true
    const item = this.data.body[active]
    const complex = (typeof item === 'object')
    const textTop = has.call(item, 'top') // if item has a top key, render text before image

    // data.body.length is number of steps, if number of steps is low,
    // then we can render them even on mobile, otherwise dont render on mobile if
    // the screen width is too small
    const totalSteps = this.data.body.length
    const pixelsPerStep = (totalSteps <= 8) ? 75 : (80 + totalSteps)
    const pixelSize = pixelsPerStep * totalSteps
    const tooSmall = (totalSteps > 4 && window.innerWidth < pixelSize)

    return (
      [
        (!tooSmall && (
          <Step.Group unstackable attached="top">
            {this.data.body.map((str, index) => <Step active={active === index} title={index + 1} />)}
          </Step.Group>
        )),
        <Modal.Content>
          <Header as="h1">{this.data.title}</Header>
          <Transition onHide={this.onHide} visible={transitionVisible} transitionOnMount animation={transitionAnimation} duration={this.transitionDuration}>
            <div>
              {complex ? (
                [
                  (textTop ? (
                    [
                      <Header as="h2">{item.text}</Header>,
                      <img className="iw100" src={item.image} alt="unable to load" />,
                    ]
                  ) : (
                    [
                      <img className="iw100" src={item.image} alt="unable to load" />,
                      <Header as="h2">{item.text}</Header>,
                    ]
                  )),
                ]
              ) : (
                <Header as="h2">{this.data.body[active]}</Header>
              )}
            </div>
          </Transition>
          {this.type !== 'gameover' && (
            // dont render checkbox if gameover concept
            <Checkbox onChange={this.handleCheckbox} className="mt2em" label="Dont show these hints again" />
          )}
        </Modal.Content>,
        <Modal.Actions>
          <Button className="ml0" color="red" name="close" onClick={this.handleButton}>Close</Button>
          {active > 0 && <Button className="ml01" color="blue" onClick={this.handleButton} name="back">Back</Button>}
          <Button color="blue" className="ml01" name={gotItButton ? 'gotit' : 'next'} onClick={this.handleButton}>{gotItButton ? 'Got It' : 'Next'}</Button>
        </Modal.Actions>,
      ]
    )
  }
}

Concept.propTypes = {
  type: PropTypes.string.isRequired,
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
