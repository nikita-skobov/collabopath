import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Modal } from 'semantic-ui-react'

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
    if (which === 'begin') {
      this.dataStore.startGame()
      this.setState({ page: 'Initial' })
    } else if (which === 'any') {
      alert('THIS FEATURE NOT IMPLEMENTED YET2222')
      this.setState({ page: 'LandingPage' })
    }
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
