import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Avatars from '@dicebear/avatars'
import SpriteCollection1 from '@dicebear/avatars-identicon-sprites'
import SpriteCollection2 from '@dicebear/avatars-male-sprites'
import SpriteCollection3 from '@dicebear/avatars-female-sprites'
import { Input, Button, Comment, Loader } from 'semantic-ui-react'

import ChatItem from './ChatItem'

const avatars1 = new Avatars(SpriteCollection1)
const avatars2 = new Avatars(SpriteCollection2)
const avatars3 = new Avatars(SpriteCollection3)
const has = Object.prototype.hasOwnProperty

export default class ChatBox extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore

    this.dataStore.rememberMe('ChatBox', this)

    this.socket = null
    this.maxChatItems = 200

    this.dataStore.tell('Sockets').connect((socket) => {
      this.setState({ connected: true })

      if (!this.socket) {
        this.socket = socket

        this.socket.emit('sni', '')

        this.socket.on('sno', (sn) => {
          this.serverName = sn
        })

        this.socket.on('disconnect', () => {
          this.setState({ connected: false })
        })

        this.socket.on('o', this.handleNewChat)
      }
    })

    this.authors = {}
    this.mutedList = this.dataStore.getMutedList()

    this.state = {
      connected: false,
      list: [],
      colorIndex: 0,
    }

    this.handleNewChat = this.handleNewChat.bind(this)
    this.handleButton = this.handleButton.bind(this)
    this.muteUser = this.muteUser.bind(this)
  }

  componentWillUnmount() {
    this.socket.disconnect()
  }

  muteUser(id) {
    if (this.mutedList.indexOf(id) === -1) {
      // only add id if it is not already in this list
      this.mutedList.push(id)
    }
  }

  handleNewChat(msg) {
    // i is id, d is date (epoch), t is the text
    const { i, d, t } = msg
    console.log(msg)

    if (this.mutedList.indexOf(i) !== -1) {
      // if the id exists in the muted list. dont add a new chat
      return null
    }

    let author = ''
    if (has.call(this.authors, i)) {
      // we already have the svg for the authors id
      author = this.authors[i]
    } else {
      // we need to make an svg:

      // first decide which avatar to use based on first character of id:
      const isCapital = /^[A-Z]/.test(i)
      const isLowerCase = /^[a-z]/.test(i)
      let svg = null
      if (isCapital) {
        // use male avatar
        svg = avatars2.create(i)
      } else if (isLowerCase) {
        // use female avatar
        svg = avatars3.create(i)
      } else {
        // use identicon avatar
        svg = avatars1.create(i)
      }
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
        authorId: i,
        sent: d,
        text: t,
        color,
        author,
      })

      if (tempState.list.length > this.maxChatItems) {
        tempState.list.splice(0, this.maxChatItems)
      }

      return tempState
    })
    return null
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
    const { list, connected } = this.state
    return (
      <div className="ps5 h100">
        <Comment.Group className="bcwr h120" minimal>
          <form name="chat" action="#" onSubmit={this.handleButton}>
            <Input style={{ width: '100%' }} action type="text" placeholder="Chat...">
              <input maxLength="600" ref={(myInput) => { this.myInput = myInput }} />
              <Button disabled={!connected} compact name="chat" onClick={this.handleButton} color="blue" type="submit">Send</Button>
            </Input>
          </form>
          <div className="h80 ofya">
            {!connected && (
              <div style={{ width: '25%', margin: 'auto', marginTop: '30px' }}>
                <Loader active inline> Connecting to Chat </Loader>
              </div>
            )}
            {connected && list.map((item) => {
              const {
                author,
                sent,
                text,
                color,
                authorId,
              } = item

              return (
                <ChatItem
                  dataStore={this.dataStore}
                  key={`${sent}${color}`}
                  color={color}
                  authorId={authorId}
                  author={author}
                  sent={sent}
                  text={text}
                />
              )
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
