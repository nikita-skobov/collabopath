/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Grid } from 'semantic-ui-react'

import CurrentVotes from './CurrentVotes'
import ChatBox from './ChatBox'

export default class CurrentVotesPage extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore

    this.state = {
      isMobile: window.innerHeight > window.innerWidth,
    }

    this.shouldResize = this.shouldResize.bind(this)

    window.addEventListener('resize', this.shouldResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.shouldResize)
  }

  shouldResize() {
    const { isMobile } = this.state
    const newIsMobile = window.innerHeight > window.innerWidth

    if (isMobile && !newIsMobile) {
      // if previous state was mobile, but new state is not mobile
      this.setState({ isMobile: false })
    } else if (!isMobile && newIsMobile) {
      // if previous state was not mobile, but new state is mobile
      this.setState({ isMobile: true })
    }
  }

  render() {
    const { isMobile } = this.state

    const maxHeight = isMobile ? 'mh50' : 'mh100'
    // if mobile, max height of this grid should take 50% of screen, otherwise 100

    const chatMarginTop = isMobile ? 'mtn18vh' : ''

    return (
      <Grid stackable columns={2} className="ms0 mtb0 h75">
        <Grid.Column style={isMobile ? {} : { maxWidth: '50%' }} className={maxHeight}>
          <CurrentVotes dataStore={this.dataStore} />
        </Grid.Column>
        <Grid.Column style={isMobile ? {} : { maxWidth: '50%' }}>
          <div className={chatMarginTop}>
            <ChatBox dataStore={this.dataStore} />
          </div>
        </Grid.Column>
      </Grid>
    )
  }
}

CurrentVotesPage.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
