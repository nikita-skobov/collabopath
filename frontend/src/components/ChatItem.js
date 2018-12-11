/* global fetch window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Button, Comment } from 'semantic-ui-react'


export default class ChatItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      authorId: props.authorId,
      author: props.author,
      sent: props.sent,
      text: props.text,
      color: props.color,
    }

    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
    const { name } = e.target
    const { author, sent, text } = this.state
    if (name === 'mute') {
      console.log('muting')
      console.log(sent)
      console.log(text)
    } else if (name === 'report') {
      console.log('reporting')
      console.log(sent)
      console.log(text)
    }
  }

  render() {
    const { author, text, color } = this.state

    return (
      <Comment style={{ padding: '1%', backgroundColor: color }}>
        <Comment.Content>
          <img style={{ width: '7%', display: 'inline-block' }} alt="svg could not load" src={author} />
          <Comment.Text style={{ display: 'inline-block', wordBreak: 'break-word' }}>{text}</Comment.Text>
          <Comment.Actions>
            <Button name="mute" onClick={this.handleButton} compact size="mini">Mute</Button>
            <Button name="report" onClick={this.handleButton} compact size="mini">Report</Button>
          </Comment.Actions>
        </Comment.Content>
      </Comment>
    )
  }
}

ChatItem.propTypes = {
  text: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  sent: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
}
