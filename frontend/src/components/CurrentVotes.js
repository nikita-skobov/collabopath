/* global fetch */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Grid, Button, Card } from 'semantic-ui-react'

import { getVotesEndpoint } from '../dynamicVars'

export default class CurrentVotes extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore

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

    if (list.length === 0) {
      return (
        <div>
          There are no paths being voted on right now
        </div>
      )
    }

    return (
      <Grid>
        {list.map(item => (
          <Grid.Row>
            <Card header={`Path ID: ${item.pathId}`} description={`Voting started about ${item.dateNum}`} />
          </Grid.Row>
        ))}
      </Grid>
    )
  }
}

CurrentVotes.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
