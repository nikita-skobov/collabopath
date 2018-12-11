/* global fetch window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Grid, Button, Card, Loader } from 'semantic-ui-react'

export default class ChatBox extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore

    this.state = {
      list: [],
      error: false,
      currentlyFetching: true,
    }

    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
    const { name } = e.target
    if (name === 'refresh') {
      this.setState({ currentlyFetching: true })
      this.fetchList()
    } else if (name === 'back') {
      this.dataStore.tell('App').nextPage(null, 'LandingPage')
    } else {
      // name is the path id
      this.dataStore.setJumpId(name)
      this.dataStore.tell('App').nextPage(null, 'Initial')
    }
  }

  render() {
    return (
      <div>dsadsa</div>
    )
  }
}

ChatBox.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
