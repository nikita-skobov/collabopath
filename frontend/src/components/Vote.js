import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'

export default class Vote extends Component {
  constructor(props) {
    // console.log('CONSTRUCTING VOTE')
    super(props)
    this.voteID = props.voteID
    this.currentPathId = props.currentPathId
    this.pathID = props.pathID
    this.dataStore = props.dataStore
    // const { voteID, currentPathId, pathID, dataStore } = props
    this.style1 = { display: 'inline-block', verticalAlign: 'middle' }

    this.state = {
      voteDone: this.dataStore.isVoteDone(this.voteID),
      voteError: '',
    }

    this.handleButton = this.handleButton.bind(this)
    // this.handlePortalClose = this.handlePortalClose.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
    if (this.currentPathId) {
      // if we are voting for a voteID where the pathID
      // matches the voteID array, then simply cast a vote
      // with this pathID and this vote ID
      this.dataStore.voteFor(this.pathID, this.voteID, (err) => {
        if (!err) this.setState({ voteDone: true })
        else this.setState({ voteError: 'Failed to Vote' })
      })
    } else {
      // otherwise get the previous pathID, and vote with the
      // current voteID
      const oldPathID = this.dataStore.getPreviousStageAtId(this.pathID)
      this.dataStore.voteFor(oldPathID, this.voteID, (err) => {
        if (!err) this.setState({ voteDone: true })
        else this.setState({ voteError: 'Failed to Vote' })
      })
    }
  }

  // handlePortalClose(e) {
  //   e.preventDefault()
  //   this.setState({ portalOpen: false })
  // }

  render() {
    // console.log('RENDERING VOTE')
    const { voteDone, voteError } = this.state
    if (voteError) {
      return <Button size="mini" style={this.style1} compact disabled onClick={this.handleButton} color="red"> {voteError} </Button>
    }
    if (voteDone) {
      return <Button size="mini" style={this.style1} compact disabled onClick={this.handleButton} color="green"> Successfully Voted </Button>
    }
    return (
      <Button size="mini" style={this.style1} compact onClick={this.handleButton} color="blue">Vote for {this.voteID}</Button>
    )
  }
}

Vote.propTypes = {
  voteID: PropTypes.string.isRequired,
  pathID: PropTypes.string.isRequired,
  currentPathId: PropTypes.bool.isRequired,
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
