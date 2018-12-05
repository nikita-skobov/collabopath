/* global window */
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
    const maxHeight = window.innerHeight > window.innerWidth ? 'mh50' : 'mh100'
    // if mobile, max height of this grid should take 50% of screen, otherwise 100

    const chatMarginTop = maxHeight === 'mh50' ? 'mtn20vh' : ''

    return (
      <Grid stackable columns={2} className="ms0 mtb0 h75">
        <Grid.Column className={maxHeight}>
          <CurrentVotes dataStore={this.dataStore} />
        </Grid.Column>
        <Grid.Column>
          <div className={chatMarginTop}>
            <div>chat</div>
          </div>
        </Grid.Column>
      </Grid>
    )
  }
}

CurrentVotesPage.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
