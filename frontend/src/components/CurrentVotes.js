/* global fetch */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { getVotesEndpoint } from '../dynamicVars'

export default class CurrentVotes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      list: [],
      error: false,
    }
  }

  fetchList() {
    // fetches the getVotes data
    // which returns an array of currently voted
    // path objects
    fetch(getVotesEndpoint)
      .then(res => res.json())
      .then((list) => {
        this.setState({ list, error: false })
      }).catch((err) => {
        console.log(err)
        this.setState({ error: true })
      })
  }
}
