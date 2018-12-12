import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Header,
  Grid,
  Button,
  Accordion,
  Icon,
  List,
} from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'

import { version } from '../../package.json'
import { Changelog as changeLogVars } from '../dynamicVars'

class Changelog extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore

    this.dataStore.tell('Navbar').handleItemClick('', { name: 'changelog' })

    this.state = {
      activeIndex: -1,
    }

    this.log = changeLogVars

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e, thing) {
    const { index } = thing
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex })
  }

  render() {
    const { activeIndex } = this.state
    const { log } = this
    const has = Object.prototype.hasOwnProperty

    const changeToPlay = () => {
      this.dataStore.tell('Navbar').handleItemClick('', { name: 'play' })
    }

    return (
      <Grid verticalAlign="middle">
        <Grid.Row />
        <Grid.Row columns={14}>
          <Grid.Column />
          <NavLink to="/">
            <Button onClick={changeToPlay} name="back" color="blue">Back</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row />
        <Grid.Row centered>
          <Header as="h1">Changelog</Header>
        </Grid.Row>
        <Grid.Row centered>
          <Header as="h3"> Current Version: {version}</Header>
        </Grid.Row>
        <Grid.Row columns={3}>
          <Grid style={{ marginLeft: '3em', marginRight: '2em' }}>
            <Accordion>
              {log.map((obj, index) => (
                [
                  <Accordion.Title active={activeIndex === index} onClick={this.handleClick} index={index}>
                    <Icon name="dropdown" />
                    {has.call(obj, 'notdone') ? `Next version: ${obj.version}` : `What${"'"}s new in ${obj.version}?`}
                  </Accordion.Title>,
                  <Accordion.Content active={activeIndex === index}>
                    <List bulleted>
                      {obj.changes.map(item => (
                        <List.Item>{item}</List.Item>
                      ))}
                    </List>
                  </Accordion.Content>,
                ]
              ))}
            </Accordion>
          </Grid>
          <Grid.Column />
        </Grid.Row>
      </Grid>
    )
  }
}

Changelog.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}

export default Changelog
