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
      <Grid stackable columns={2} className="ms0 mtb0 h88">
        <Grid.Column>
          <CurrentVotes dataStore={this.dataStore} />
        </Grid.Column>
        <Grid.Column>
          <div>chat</div>
        </Grid.Column>
      </Grid>
    )
  }
}

CurrentVotesPage.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
