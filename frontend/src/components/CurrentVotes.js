/* global fetch window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Grid, Button, Card, Loader } from 'semantic-ui-react'

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
        <Grid className="ms0 mtb0">
          <Grid.Row className="ptb0">
            <Card
              style={{ margin: 'auto', width: '90%' }}
              header={<Button name="refresh" fluid color="blue">Refresh</Button>}
            />
          </Grid.Row>
          <Grid.Row>
            <Loader active inline> Loading Next Path </Loader>
          </Grid.Row>
          <Grid.Row className="ptb0">
            <Card
              style={{ margin: 'auto', width: '90%' }}
              header={<Button fluid name="refresh" color="blue">Refresh</Button>}
            />
          </Grid.Row>
        </Grid>
      )
    }

    if (error) {
      return (
        <div>oopsies there was an error</div>
      )
    }

    if (list.length === 0) {
      return (
        <Grid className="ms0 mtb0">
          <Grid.Row className="ptb0">
            <h1>There are no paths currently being voted on</h1>
          </Grid.Row>
          <Grid.Row className="ptb0">
            <Card
              style={{ margin: 'auto', width: '90%' }}
              header={<Button fluid name="refresh" color="blue">Refresh</Button>}
            />
          </Grid.Row>
        </Grid>
      )
    }

    return (
      <Grid className="ms0 mtb0">
        <Grid.Row className="ptb0">
          <Card
            style={{ margin: 'auto', width: '90%' }}
            header={<Button name="refresh" fluid color="blue">Refresh</Button>}
          />
        </Grid.Row>
        {list.map((item) => {
          const timeNow = new Date(new Date().getTime()).getTime()
          const timeThen = new Date(parseInt(item.dateNum, 10)).getTime()
          const minDiff = Math.ceil((timeNow - timeThen) / 1000 / 60)

          return (
            <Grid.Row className="ptb0">
              <Card
                style={{ margin: 'auto', width: '90%' }}
                header={`Path ID: ${item.pathId}`}
                meta={`Voting started about ${minDiff} minutes ago`}
                description={<Button size="mini" color="blue">View</Button>}
              />
            </Grid.Row>
          )
        })}
        <Grid.Row className="ptb0">
          <Card
            style={{ margin: 'auto', width: '90%' }}
            header={<Button fluid name="refresh" color="blue">Refresh</Button>}
          />
        </Grid.Row>
      </Grid>
    )
  }
}

CurrentVotes.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
