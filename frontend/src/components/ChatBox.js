/* global fetch window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Input, Button, Card, Loader, Comment } from 'semantic-ui-react'

import ChatItem from './ChatItem'

export default class ChatBox extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore

    this.state = {
      list: [],
      error: false,
      currentlyFetching: true,
    }

    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
    const { name } = e.target
    if (name === 'chat') {
      console.log(this.myInput)
      // this.setState({ currentlyFetching: true })
      // this.fetchList()
    }
  }

  render() {
    const { list } = this.state
    return (
      <div>
        <Comment.Group minimal>
          <Input style={{ width: '100%' }} action type="text" placeholder="chat">
            <input ref={(myInput) => { this.myInput = myInput }} />
            <Button name="chat" onClick={this.handleButton} color="blue" type="submit">Send Chat</Button>
          </Input>
          {list.map(item => (
            <ChatItem author={item.author} sent={item.sent} text={item.text} />
          ))}
        </Comment.Group>
      </div>
    )
  }
}

ChatBox.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
