import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Grid,
  Button,
  Transition,
  Image,
} from 'semantic-ui-react'

import { ChooseStartingItem as startingItemVars } from '../dynamicVars'

export default class ChooseStartingItem extends Component {
  constructor(props) {
    // console.log('RENDERING CHOOSESTARTINGITEMS')
    super(props)

    this.callback = props.callback

    this.allowedItems = startingItemVars.allowedItems
    this.transitionDuration = startingItemVars.transitionDuration
    this.howManyItemsToPick = startingItemVars.howManyToPick

    this.state = {
      visible: true,
    }

    this.pickNItems = this.pickNItems.bind(this)
    this.onHide = this.onHide.bind(this)
    this.itemChosen = this.itemChosen.bind(this)

    this.chosenItems = this.pickNItems()

    this.itemSelection = null
  }

  onHide() {
    this.callback(null, this.itemSelection)
  }

  itemChosen(e) {
    e.preventDefault()
    const { name } = e.target
    const ind = parseInt(e.target.getAttribute('ind'), 10)
    this.itemSelection = name
    this.chosenItems[ind].visible = false
    this.setState({ visible: false })
  }

  pickNItems() {
    const items = this.allowedItems
    const arrLength = items.length
    const maxItems = this.howManyItemsToPick
    const indexArr = []

    while (indexArr.length < maxItems) {
      const index = Math.floor(Math.random() * arrLength)
      if (indexArr.indexOf(index) === -1) indexArr.push(index)
    }

    return indexArr.map((ind) => {
      const item = items[ind]
      item.visible = true
      return item
    })
  }

  render() {
    return (
      <Grid className="ps3vw" id="choose-starting" columns={4} centered doubling>
        {this.chosenItems.map((item, ind) => (
          <Grid.Column>
            <Transition onHide={this.onHide} animation="fly down" visible={item.visible} duration={this.transitionDuration}>
              <Button style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} ind={ind} name={item.name} onClick={this.itemChosen} compact color="purple">
                <Image ind={ind} size="medium" name={item.name} src={item.src} />
              </Button>
            </Transition>
          </Grid.Column>
        ))}
        <div style={{ height: '260px' }} />
      </Grid>
    )
  }
}

ChooseStartingItem.propTypes = {
  callback: PropTypes.func.isRequired,
}
