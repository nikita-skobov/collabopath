import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Header,
  Grid,
  Button,
  Transition,
} from 'semantic-ui-react'

import { NavLink } from 'react-router-dom'

import { version } from '../../package.json'
import { LandingPage as landingPageVars } from '../dynamicVars'
// import HowItWorks from './HowItWorks'
import Suggestions from './Suggestions'

export default class LandingPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hide: 500,
      show: 500,
      visible: true,
      howItWorks: false,
      suggestions: false,
    }

    this.callback = props.callback

    this.handleButton = this.handleButton.bind(this)
    this.pageDone = this.pageDone.bind(this)

    this.pageChoice = null
  }

  handleButton(e) {
    e.preventDefault()
    const { name } = e.target
    if (name === 'begin') {
      this.pageChoice = e.target.name
      const { visible } = this.state
      this.setState({ visible: !visible })
    } else if (name === 'works') {
      const { howItWorks } = this.state
      this.setState({ howItWorks: !howItWorks })
    } else if (name === 'suggestions') {
      const { suggestions } = this.state
      this.setState({ suggestions: !suggestions })
    } else if (name === 'any') {
      this.pageChoice = name
      const { visible } = this.state
      this.setState({ visible: !visible })
    }
  }

  pageDone() {
    // switch to the 'Initial' page
    // where the users stats are allocated
    this.callback(this.pageChoice)
  }

  render() {
    const { hide, show, visible, howItWorks, suggestions } = this.state

    return (
      <div>
        <Transition duration={{ hide, show }} onHide={this.pageDone} visible={visible}>
          <Grid className="landinggrid">
            <Grid.Row />
            <Grid.Row />
            <Grid.Row centered columns={1}>
              <Header textAlign="center" className="em3h" as="h1" size="huge">{landingPageVars.title}</Header>
            </Grid.Row>
            <Grid.Row className="ps3em" centered columns={1}>
              <p>
                Beta Version {version}. <NavLink style={{ color: '#0063c5' }} to="/changelog">Check out the changelog</NavLink>
                <br />
                For chatting with other users, and reporting offensive content check out our <a style={{ color: '#0063c5' }} href="https://discord.gg/rwSrC4c" target="_blank" rel="noopener noreferrer">Discord</a>
                <br />
                If you want to help with the site, or just want to look at the code, check out our <a style={{ color: '#0063c5' }} href="https://github.com/nikita-skobov/collabopath" target="_blank" rel="noopener noreferrer">Github</a>
              </p>
            </Grid.Row>
            <Grid.Row centered columns={1}>
              <Header textAlign="center" className="ps15vw" as="h2" size="small">{landingPageVars.body}</Header>
            </Grid.Row>
            <Grid.Row className="ps3em" centered columns={1}>
              <Button size="huge" name="begin" color="green" onClick={this.handleButton}>
                Click Here to start from the beginninng
              </Button>
            </Grid.Row>
            <Grid.Row className="ps3em" centered columns={1}>
              <Button size="big" name="any" color="gray" onClick={this.handleButton}>
                Click Here to start from a specific id
              </Button>
            </Grid.Row>
            <Grid.Row className="ps3em" centered columns={1}>
              <NavLink to="/currentvotes">
                <Button size="big" name="any" color="gray">
                  Click Here to view the most recent paths
                </Button>
              </NavLink>
            </Grid.Row>
            <Grid.Row centered columns={1}>
              <Button name="suggestions" color="grey" onClick={this.handleButton}>
                Suggestions?
              </Button>
            </Grid.Row>
            {suggestions && <Suggestions />}
            {/* <Grid.Row centered columns={1}>
              <Button name="works" color="grey" onClick={this.handleButton}>
                How it works
              </Button>
            </Grid.Row>
            {howItWorks && <HowItWorks />} */}
            <Grid.Row />
            <Grid.Row />
          </Grid>
        </Transition>
      </div>
    )
  }
}

LandingPage.propTypes = {
  callback: PropTypes.func.isRequired,
}
