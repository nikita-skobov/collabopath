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

export default class App extends Component {
  constructor(props) {
    super(props)
    this.dataStore = props.dataStore

    this.state = {
      page: this.dataStore.gameStarted() ? 'Initial' : 'LandingPage',
      modalOpen: false,
      conceptType: null,
      startChoice: null,
    }

    this.nextPage = this.nextPage.bind(this)
    this.changeGameBarState = this.changeGameBarState.bind(this)

    this.resetGame = this.resetGame.bind(this)
    this.newConceptModal = this.newConceptModal.bind(this)
    this.closeConceptModal = this.closeConceptModal.bind(this)

    this.dataStore.rememberMe('App', this)
  }

  resetGame() {
    // console.log('inside reset game?')
    this.setState({ page: 'LandingPage' })
  }

  nextPage(which) {
    this.setState({ startChoice: which, page: 'Warning' })
    // if (which === 'begin') {
    //   this.dataStore.startGame()
    //   this.setState({ page: 'Initial' })
    // } else if (which === 'any') {
    //   this.dataStore.startGame()
    //   this.dataStore.dangerouslySetStage(911)
    //   this.setState({ page: 'Initial' })
    // }
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
    const { page, modalOpen, conceptType } = this.state
    if (page === 'LandingPage') {
      return (
        <div>
          <LandingPage callback={this.nextPage} />
        </div>
      )
    }
    if (page === 'Warning') {
      return (
        <Transition animation="scale" transitionOnMount duration={this.transitionDuration}>
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
              <Button color="green">I accept that I might see some offensive content</Button>
            </Grid.Row>
            <Grid.Row>
              <Button color="red" size="small">{`Nevermind. I don${"'"}t want to play`}</Button>
            </Grid.Row>
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
