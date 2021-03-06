import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Modal,
  Header,
  Grid,
  Button,
  Transition,
} from 'semantic-ui-react'

import LandingPage from './components/LandingPage'
import GameBar from './components/GameBar'
import PathViewer from './components/PathViewer'
import Concept from './components/Concept'
import CurrentVotesPage from './components/CurrentVotesPage'

import { PathViewer as pathViewerVars } from './dynamicVars'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.dataStore = props.dataStore

    this.state = {
      page: this.dataStore.gameStarted() ? 'Initial' : 'LandingPage',
      modalOpen: false,
      conceptType: null,
      startChoice: null,
      transitionVisible: true,
      warningChoice: null,
    }

    this.transitionDuration = pathViewerVars.outerTransitionDuration

    this.nextPage = this.nextPage.bind(this)
    this.changeGameBarState = this.changeGameBarState.bind(this)
    this.changeToCurrent = this.changeToCurrent.bind(this)
    this.resetGame = this.resetGame.bind(this)
    this.newConceptModal = this.newConceptModal.bind(this)
    this.closeConceptModal = this.closeConceptModal.bind(this)
    this.handleWarning = this.handleWarning.bind(this)
    this.onTransitionHide = this.onTransitionHide.bind(this)

    this.dataStore.rememberMe('App', this)
  }

  onTransitionHide() {
    const { warningChoice, startChoice } = this.state
    if (warningChoice === 'accept') {
      // user accpets, so take them to the correct page based on their
      // initial button choice
      if (startChoice === 'begin') {
        this.dataStore.startGame()
        this.setState({ page: 'Initial', transitionVisible: true })
      } else if (startChoice === 'any') {
        this.dataStore.startGame()
        this.dataStore.dangerouslySetStage(911)
        this.setState({ page: 'Initial', transitionVisible: true })
      }
    } else {
      // user does not want to play, so put them back at landing page
      this.setState({
        transitionVisible: true,
        page: 'LandingPage',
      })
    }
  }

  handleWarning(e) {
    e.preventDefault()
    const { name } = e.target
    this.setState({ warningChoice: name, transitionVisible: false })
  }

  changeToCurrent() {
    this.setState({ page: 'current' })
  }

  resetGame() {
    this.setState({ page: 'LandingPage' })
  }

  nextPage(which, page) {
    this.setState({ startChoice: which, page })
  }

  changeGameBarState(obj) {
    this.dataStore.tell('GameBar').updateFunction(obj)
  }

  newConceptModal(type) {
    if (!this.state.modalOpen) {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.modalOpen = true
        tempState.conceptType = type
        return tempState
      })
    }
  }

  closeConceptModal() {
    this.setState((prevState) => {
      const tempState = prevState
      tempState.modalOpen = false
      tempState.conceptType = null
      return tempState
    })
  }

  render() {
    const { page, modalOpen, conceptType, transitionVisible } = this.state

    if (page === 'LandingPage') {
      return (
        <div>
          <LandingPage dataStore={this.dataStore} callback={this.nextPage} />
        </div>
      )
    }
    if (page === 'current') {
      return (
        <CurrentVotesPage dataStore={this.dataStore} />
      )
    }
    if (page === 'Warning') {
      return (
        <Transition onHide={this.onTransitionHide} animation="scale" visible={transitionVisible} transitionOnMount duration={this.transitionDuration}>
          <Grid style={{ marginTop: '25vh' }} verticalAlign="middle" columns={1} centered>
            <Grid.Row className="ps3em">
              <Header className="em3h" as="h1">Warning</Header>
            </Grid.Row>
            <Grid.Row>
              <Header className="ps3em" as="h2">
                This game has content created by other users. Some of the paths you encounter might have offensive content. If you see any offensive content please report it on our <a style={{ color: '#0063c5' }} href="https://discord.gg/rwSrC4c" target="_blank" rel="noopener noreferrer">Discord</a>
              </Header>
            </Grid.Row>
            <Grid.Row>
              <Button name="accept" onClick={this.handleWarning} color="green">I accept that I might see some offensive content</Button>
            </Grid.Row>
            <Grid.Row>
              <Button name="deny" onClick={this.handleWarning} color="red" size="small">{`Nevermind. I don${"'"}t want to play`}</Button>
            </Grid.Row>
            <Grid.Row />
            <Grid.Row />
          </Grid>
        </Transition>
      )
    }
    return (
      <div>
        <Modal open={modalOpen} closeOnDimmerClick={false} closeOnDocumentClick={false} onClose={this.closeConceptModal}>
          <Concept dataStore={this.dataStore} type={conceptType} />
        </Modal>
        <GameBar dataStore={this.dataStore} />
        <PathViewer dataStore={this.dataStore} />
      </div>
    )
  }
}

App.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
