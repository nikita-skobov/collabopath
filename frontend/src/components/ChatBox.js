import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Avatars from '@dicebear/avatars'
import SpriteCollection from '@dicebear/avatars-identicon-sprites'
import { Input, Button, Comment } from 'semantic-ui-react'

import ChatItem from './ChatItem'

const avatars = new Avatars(SpriteCollection)
const has = Object.prototype.hasOwnProperty

export default class ChatBox extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore

    this.socket = this.dataStore.tell('Sockets')
    this.socket.connect()

    this.socket.on('connect', () => {
      this.socket.emit('sni', '')

      this.socket.on('sno', (sn) => {
        this.serverName = sn
      })

      this.socket.on('o', this.handleNewChat)
    })

    this.authors = {}

    this.state = {
      list: [],
      colorIndex: 0,
    }

    this.handleNewChat = this.handleNewChat.bind(this)
    this.handleButton = this.handleButton.bind(this)
  }

  componentWillUnmount() {
    this.socket.disconnect()
  }

  handleNewChat(msg) {
    // i is id, d is date (epoch), t is the text
    const { i, d, t } = msg
    let author = ''
    if (has.call(this.authors, i)) {
      // we already have the svg for the authors id
      author = this.authors[i]
    } else {
      // we need to make an svg:
      const svg = avatars.create(i)
      const svgstr = encodeURIComponent(svg)
      const dataUri = `data:image/svg+xml,${svgstr}`
      this.authors[i] = dataUri
      author = dataUri
    }

    this.setState((prevState) => {
      const tempState = prevState
      const { colorIndex } = tempState
      let color = 'white'
      if (colorIndex) {
        color = '#e4e4e4'
        tempState.colorIndex = 0
      } else {
        tempState.colorIndex = 1
      }
      tempState.list.unshift({
        sent: d,
        text: t,
        color,
        author,
      })
      return tempState
    })
  }

  handleButton(e) {
    e.preventDefault()
    const { name } = e.target
    if (name === 'chat') {
      const { value } = this.myInput
      this.socket.emit('i', value)
      this.myInput.value = ''
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
              const { author, sent, text, color } = item
              return <ChatItem key={sent} color={color} author={author} sent={sent} text={text} />
            })}
            <div style={{ height: '30px' }} />
          </div>
        </Comment.Group>
      </div>
    )
  }
}

ChatBox.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
