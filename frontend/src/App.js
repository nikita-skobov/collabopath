import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Modal,
  Header,
  Grid,
  Button,
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
        <div>
          <h1>this is a warning</h1>
        </div>
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
