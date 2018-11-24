/* global window */
import React, { Component } from 'react'
import { Menu, Segment } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'

export default class Navbar extends Component {
  constructor(props) {
    super(props)
    try {
      if (window.location.pathname.includes('about')) {
        this.state = { activeItem: 'about' }
      } else if (window.location.pathname.includes('support')) {
        this.state = { activeItem: 'support' }
      } else if (window.location.pathname === '/') {
        this.state = { activeItem: 'play' }
      } else {
        // incase 404
        this.state = { activeItem: '' }
      }
    } catch (e) {
      this.state = { activeItem: 'play' }
    }
    this.handleItemClick = this.handleItemClick.bind(this)
  }

  handleItemClick(e, { name }) {
    this.setState({ activeItem: name })
  }

  render() {
    const { activeItem } = this.state

    const myStyle = {
      borderColor: '#2185d0',
    }
    const myStyle2 = {
      border: 'none',
    }

    return (
      <Segment size="mini" style={myStyle} attached compact inverted color="blue">
        <Menu size="large" style={myStyle2} inverted secondary pointing>
          <Menu.Menu position="left">
            <NavLink id="home-nav" to="/">
              <Menu.Item
                name="play"
                active={activeItem === 'play'}
                onClick={this.handleItemClick}
              />
            </NavLink>
          </Menu.Menu>
          <Menu.Menu position="right">
            <NavLink id="support-nav" to="/support">
              <Menu.Item
                name="support"
                active={activeItem === 'support'}
                onClick={this.handleItemClick}
              />
            </NavLink>
            <NavLink id="about-nav" to="/about">
              <Menu.Item
                name="about"
                active={activeItem === 'about'}
                onClick={this.handleItemClick}
              />
            </NavLink>
          </Menu.Menu>
        </Menu>
      </Segment>
    )
  }
}
