import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CurrentVotes from './CurrentVotes'

export default class CurrentVotesPage extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore
  }

  render() {
    return (
      <div>
        <CurrentVotes dataStore={this.dataStore} />
        <div>chat</div>
      </div>
    )
  }
}

CurrentVotesPage.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
