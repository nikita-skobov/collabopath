/* global fetch window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Button, Comment } from 'semantic-ui-react'


export default class ChatItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      author: props.author,
      sent: props.sent,
      text: props.text,
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
    const { author, text } = this.state
    return (
      <Comment style={{ padding: '1%' }}>
        <Comment.Content>
          <img style={{ width: '7%', display: 'inline-block' }} alt="svg could not load" src={author} />
          <Comment.Text style={{ display: 'inline-block', wordBreak: 'break-word' }}>{text}</Comment.Text>
          <Comment.Actions>
            <a href="#">mute</a>
            <a href="#">report</a>
          </Comment.Actions>
        </Comment.Content>
      </Comment>
    )
  }
}

ChatItem.propTypes = {
  text: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  sent: PropTypes.number.isRequired,
}
