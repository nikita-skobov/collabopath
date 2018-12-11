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
      const { value } = this.myInput
      this.myInput.value = ''
      this.setState((prevState) => {
        const tempState = prevState
        tempState.list.unshift({
          author: 'im an author',
          sent: new Date().getTime(),
          text: value,
        })
        return tempState
      })
    }
  }

  render() {
    const { list } = this.state
    return (
      <div className="ps5 h100">
        <Comment.Group className="bcwr h120" minimal>
          <form name="chat" action="#" onSubmit={this.handleButton}>
            <Input style={{ width: '100%' }} action type="text" placeholder="Chat...">
              <input ref={(myInput) => { this.myInput = myInput }} />
              <Button compact name="chat" onClick={this.handleButton} color="blue" type="submit">Send</Button>
            </Input>
          </form>
          <div className="h80 ofya">
            {list.map((item) => {
              const { author, sent, text } = item
              return <ChatItem key={sent} author={author} sent={sent} text={text} />
            })}
          </div>
        </Comment.Group>
      </div>
    )
  }
}

ChatBox.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
