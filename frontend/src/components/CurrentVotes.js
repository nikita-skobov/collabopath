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
      currentlyFetching: true,
    }

    this.fetchList()
  }

  fetchList() {
    // fetches the getVotes data
    // which returns an array of currently voted
    // path objects
    fetch(getVotesEndpoint)
      .then(res => res.json())
      .then((list) => {
        this.setState({ list, error: false, currentlyFetching: false })
      }).catch((err) => {
        console.log(err)
        this.setState({ error: true, currentlyFetching: false })
      })
  }

  render() {
    const { error, list, currentlyFetching } = this.state

    if (currentlyFetching) {
      return (
        <div>Loading....</div>
      )
    }

    if (error) {
      return (
        <div>oopsies there was an error</div>
      )
    }

    return (
      <div>
        <p>here are the items:</p>
        {list.map(item => (
          <div>{item.pathId}, {item.dateNum}</div>
        ))}
      </div>
    )
  }
}
