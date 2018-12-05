import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Grid } from 'semantic-ui-react'

import CurrentVotes from './CurrentVotes'

export default class CurrentVotesPage extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore
  }

  render() {
    return (
      <Grid className="ms0 mtb0 h88">
        <Grid.Row className="mh100">
          <CurrentVotes dataStore={this.dataStore} />
        </Grid.Row>
        <Grid.Row>
          <div>chat</div>
        </Grid.Row>
      </Grid>
    )
  }
}

CurrentVotesPage.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
