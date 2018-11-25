import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Transition,
  Grid,
  Header,
  Modal,
  Icon,
  Dropdown,
} from 'semantic-ui-react'

import PathEffect from './PathEffect'
import Vote from './Vote'
import PathChoices from './PathChoices'
import { Path as pathVars } from '../dynamicVars'

const PathID = (props) => {
  const {
    id,
    modalOpen,
    callback, // this is a callback function for triggering restartGame
    notFinalized,
    exists,
    refresh, // this is a callback function for going back a level
    votes,
    currentVoteIndex,
    dataStore,
    badError,
  } = props

  const style1 = { display: 'inline-block', verticalAlign: 'middle' }
  const style2 = { ...style1, marginLeft: '0.3rem' }
  const style3 = { ...style1, backgroundColor: '#2185d0', minHeight: '0', paddingTop: '0.3rem', paddingBottom: '0.3rem', color: 'white' }

  const voteOptions = []
  votes.forEach((str, ind) => voteOptions.push({ key: ind, text: str, value: str }))

  const dropDownChange = (e, { value }) => {
    if (e.target.nodeName === 'SPAN') {
      // only use refreshCallback if the user
      // actually clicked on a different voteID. otherwise
      // no need to re-render anything.
      // console.log(`re rendering with voteID: ${value}`)
      let voteIndex = null
      const goBack = !exists // if we are on the very last
      // path, then changing the voteID dropdown
      // should make it go back one path.
      votes.forEach((str, ind) => {
        if (str === value) voteIndex = ind
      })
      refresh(voteIndex, goBack)
    }
  }

  return (
    <div style={{ textAlign: 'left', marginLeft: '0.3rem', marginTop: '0.2rem' }}>
      <Modal
        onClose={callback}
        closeOnDimmerClick
        open={modalOpen}
        trigger={<Button name="open" color="red" style={style1} onClick={callback} size="mini" compact>Restart</Button>}
      >
        <Modal.Header>
          Are you sure you want to restart from the beginning? This will
           delete your inventory, and all of your stats.
        </Modal.Header>
        <Modal.Content>
          <Button name="close" onClick={callback} size="small" color="green" compact> Nevermind </Button>
          <Button name="closeandreset" onClick={callback} size="small" color="green" compact> Yes </Button>
        </Modal.Content>
      </Modal>
      {notFinalized && (
        <Dropdown compact style={style3} selection onChange={dropDownChange} options={voteOptions} value={votes[currentVoteIndex]} />
        // only render votes dropdown if on notFinalized object
      )}
      {notFinalized && (
        <Vote key={votes[currentVoteIndex]} dataStore={dataStore} currentPathId={exists} pathID={id} voteID={votes[currentVoteIndex]} />
      )}
      {notFinalized && !exists && (
        // only render back button when you are on a nonfinalized object
        // and you have clicked on one of the choices. it makes sense because you
        // should be able to click back and look at one of the OTHER choices
        <Button style={style1} size="mini" compact color="blue">Back</Button>
      )}
      {(!exists && !notFinalized) && (
        // only render refresh button when there is no pathObj
        <Button onClick={() => { refresh(-1, -1) }} color="blue" style={style1} size="mini" compact>
          <Icon style={{ margin: 'auto' }} name="sync alternate" />
        </Button>
      )}
      {(badError) && (
        // if its a bad error, render a refresh icon in red
        <Button onClick={() => { refresh(-1, -1) }} color="red" style={style1} size="mini" compact>
          <Icon style={{ margin: 'auto' }} name="sync alternate" />
        </Button>
      )}
      <div style={style2}>{id !== '.' && `Current Path ID: ${id}`}</div>
    </div>
  )
}

PathID.defaultProps = {
  votes: [],
  currentVoteIndex: 0,
}

PathID.propTypes = {
  callback: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  badError: PropTypes.bool.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  notFinalized: PropTypes.bool.isRequired,
  exists: PropTypes.bool.isRequired,
  refresh: PropTypes.func.isRequired,
  votes: PropTypes.instanceOf(Array),
  currentVoteIndex: PropTypes.number,
  dataStore: PropTypes.instanceOf(Object).isRequired,
}

const PathText = (props) => {
  const { text } = props
  return (
    <Header style={{ maxWidth: '90%', margin: '3vh auto', wordBreak: 'break-word' }} as="h1" size="large">
      {text}
    </Header>
  )
}

PathText.propTypes = {
  text: PropTypes.string.isRequired,
}

const PathImg = (props) => {
  const { img } = props
  return (
    <img src={img} style={{ maxWidth: '100%', marginTop: '0.3rem' }} alt="some text" />
  )
}

PathImg.propTypes = {
  img: PropTypes.string.isRequired,
}

export default class Path extends Component {
  constructor(props) {
    super(props)
    this.dataStore = props.dataStore

    const stage = this.dataStore.getStage()
    const prevStage = this.dataStore.getPreviousStageAtId(stage)

    this.transitionDuration = pathVars.transitionDuration

    const currentObj = this.dataStore.getPathObj(stage)

    this.state = {
      id: stage,
      selection: this.dataStore.getPreviousDirectionAtId(prevStage),
      obj: currentObj,
      prevObj: this.dataStore.getPathObj(prevStage),
      notFinalIndex: this.dataStore.getNotFinalIndex(),
      visible: true,
      restartModalOpen: false,
      effectDone: false,
    }

    if (currentObj === null) {
      this.dataStore.fetchObject(stage, (err, data) => {
        if (err) {
          if (err === 'OBJNOEXIST') {
            // console.log('obj dont exist, but we set state anyway.')
            this.setState((prevState) => {
              const tempState = prevState
              tempState.obj = data
              return tempState
            })
          } else {
            this.setState((prevState) => {
              const tempState = prevState
              if (err === 'FETCHERROR' && window.location.port !== '') {
                // special case. if running on localhost, you will have a port number
                // whereas on the live site, there is no port. in case of a fetch
                // error, this allows the user to still see the make your own
                // path object button
                tempState.obj = { doesNotExist: 'yes' }
              } else {
                tempState.obj = { badError: 'yes' }
              }
              return tempState
            })
          }
        } else {
          let ind = this.state.notFinalIndex
          if (Array.isArray(data)) {
            // if it returns an array instead of a single object
            // then it means its not finalized yet: in this case
            // pick a random array index, and use that as the notFinalIndex
            // so that when its rendered it renders one of the array items
            ind = Math.floor(Math.random() * data.length)
            this.dataStore.setNotFinalIndex(ind)
          }
          this.setState((prevState) => {
            const tempState = prevState
            tempState.obj = data
            tempState.notFinalIndex = ind
            return tempState
          })
        }
      })
    }

    this.onHide = this.onHide.bind(this)
    this.handlePathChoice = this.handlePathChoice.bind(this)
    this.toggleRestartModal = this.toggleRestartModal.bind(this)
    this.effectDoneCallback = this.effectDoneCallback.bind(this)
    this.refreshCallback = this.refreshCallback.bind(this)
    this.refresh = this.refresh.bind(this)
  }

  onHide() {
    const has = Object.prototype.hasOwnProperty
    const newPathId = this.dataStore.getEncodedPath()
    const { id } = this.state
    const dir = this.dataStore.getPreviousDirectionAtId(id)
    let effectDoneOuter = true

    this.setState((prevState) => {
      const { obj, notFinalIndex } = prevState
      const tempObj = this.dataStore.getPathObj(newPathId)
      if (tempObj === null || has.call(tempObj, 'doesNotExist')) {
        // two scenarios where we want to fetch the object:
        // 1. if we do not have the object in dataStore,
        // so try to fetch it from server
        // 2. if we have the object, but it just says 'doesNotExist'
        // then try to fetch it from server because maybe it now exists
        // since the last time we fetched it...
        this.dataStore.fetchObject(newPathId, (err, data) => {
          if (err) {
            if (err === 'OBJNOEXIST') {
              // console.log('obj dont exist, but we set state anyway.')
              this.setState({ obj: data })
            } else if (err === 'FETCHERROR' && window.location.port !== '') {
              // special case. if running on localhost, you will have a port number
              // whereas on the live site, there is no port. in case of a fetch
              // error, this allows the user to still see the make your own
              // path object button
              this.setState({ obj: { doesNotExist: 'yes' } })
            } else {
              this.setState({ obj: { badError: 'yes' } })
            }
          } else {
            let ind = prevState.notFinalIndex
            if (Array.isArray(data)) {
              // if it returns an array instead of a single object
              // then it means its not finalized yet: in this case
              // pick a random array index, and use that as the notFinalIndex
              // so that when its rendered it renders one of the array items
              ind = Math.floor(Math.random() * data.length)
              this.dataStore.setNotFinalIndex(ind)
            }
            this.setState({ obj: data, notFinalIndex: ind })
          }
        })
      }


      if (Array.isArray(obj)) {
        if (obj[notFinalIndex][dir].effect !== 'NONE') {
          effectDoneOuter = false
          // effectDone determines if the buttons are available to press
          // we only want to display the buttons when the next object is available
          // AND the current effect is done. so if the effect is anything other than
          // NONE then we dont want the buttons to be displayed right away.
        }
      } else if (obj[dir].effect !== 'NONE') {
        effectDoneOuter = false
      }

      return {
        effectDone: effectDoneOuter,
        selection: dir,
        prevObj: obj,
        id: newPathId,
        obj: tempObj,
        visible: true,
      }
    })
  }

  effectDoneCallback(onlyChangeEffectDone) {
    if (onlyChangeEffectDone) {
      this.setState({ effectDone: true })
    } else {
      const { id, prevObj, notFinalIndex } = this.state
      let vid = '.'
      if (id !== '.') {
        const prevId = this.dataStore.getPreviousStageAtId(id)
        if (Array.isArray(prevObj)) {
          vid = prevObj[notFinalIndex].voteId
        }
        this.dataStore.effectDone(prevId, vid)
        // this ensures that if this path is re-rendered
        // that the effect does not run again.
        // we must check if prevObj is an array, in which case
        // its a non-finalized obj, so combine it with its voteID
        // so that if you render a different obj within that array, it will
        // still work...
      }
      this.setState({ effectDone: true })
    }
  }

  handlePathChoice(e) {
    // gets called when one of the path choice buttons is pressed
    e.preventDefault()
    const direction = e.target.name
    this.dataStore.appendPath(direction)
    const { id, obj } = this.state
    const newPathId = this.dataStore.getEncodedPath()

    if (this.dataStore.isConceptActive('merchant')) {
      // after a merchant modal pops up,
      // and the user clicks on the next choice, set Active Concept to null
      // so that PathViewer's shouldComponentUpdate() method will return true
      // from now on.
      this.dataStore.setActiveConcept(null)
    }

    if (!Array.isArray(obj)) {
      // apply game step only if we are stepping
      // from a finalized object
      this.dataStore.tell('GameBar').applyStep()
    }
    this.dataStore.setStage(newPathId)
    this.dataStore.setDirection(direction, id)
    this.dataStore.setMerchantItems(null)

    this.setState({ visible: false })
  }

  toggleRestartModal(e) {
    // gets called when user presses the restart button
    // from there the user can either press
    // the nevermind button, or the closeandreset button
    e.preventDefault()
    const action = e.target.name
    if (action === 'open') {
      this.setState({ restartModalOpen: true })
    } else if (action === 'closeandreset') {
      this.dataStore.resetGame()
    } else {
      this.setState({ restartModalOpen: false })
    }
  }

  refresh(goBack) {
    const { id } = this.state
    let pathId = id
    if (goBack) {
      // if we go back one level, pathId should be previous pathId
      pathId = this.dataStore.getPreviousStageAtId(id)
    }

    this.dataStore.fetchObject(pathId, (err, data) => {
      if (err) {
        if (err === 'OBJNOEXIST') {
          // console.log('obj dont exist, but we set state anyway.')
          // this.setState({ obj: data })
        } else {
          // console.log(data)
        }
      } else {
        this.setState({ obj: data })
      }
    })
  }

  refreshCallback(voteIndex, goBack) {
    // used when changing a voteId dropdown item
    // voteIndex is the new index of the voteId object
    // that should be rendered
    // go back is a flag that determines if we should go back one path

    if (voteIndex === -1 && goBack === -1) {
      // special case. when clicking the refresh button it passes -1 as
      // both parameters
      if (this.dataStore.canRefresh()) {
        this.refresh(false)
      }
    } else {
      if (this.dataStore.canRefresh()) {
        // check if the last refresh time was recent or not
        // prevent user from making API call too quickly
        this.refresh(goBack)
      }

      this.setState((prevState) => {
        const tempState = prevState

        if (goBack) {
          this.dataStore.popPath() // removes the last path choice
          tempState.id = this.dataStore.getEncodedPath()
          this.dataStore.setStage(tempState.id)
          tempState.obj = this.dataStore.getPathObj(tempState.id)
          const previousStage = this.dataStore.getPreviousStageAtId(tempState.id)
          const previousDirection = this.dataStore.getPreviousDirectionAtId(previousStage)
          tempState.prevObj = this.dataStore.getPathObj(previousStage)
          tempState.selection = previousDirection
        }

        this.dataStore.setNotFinalIndex(voteIndex)
        tempState.notFinalIndex = voteIndex
        return tempState
      })
    }
  }

  render() {
    const has = Object.prototype.hasOwnProperty
    let {
      id,
      obj,
      prevObj,
      selection,
      notFinalIndex,
      visible,
      restartModalOpen,
      effectDone,
    } = this.state


    const prevId = this.dataStore.getPreviousStageAtId(id)

    let notFinalizedObj = false
    let prevNotFinal = false
    let objectExists = true
    let badError = false
    const voteIds = []
    let effectDoneBefore = false // if we are re-rendering this path after coming
    // back from a different page, ie: About, Support, etc. make sure to not apply
    // the effect again.

    if (Array.isArray(obj)) {
      notFinalizedObj = true
      obj.forEach(item => voteIds.push(item.voteId))
      if (notFinalIndex === null) {
        // this happens because notFinalIndex gets set when the client finishes
        // making a getPathObject lambda request, and lambda returns an array.
        // the fetch callback picks a random nummber, and sets that as the index.
        // this block is ran when the path object already exists in the dataStore,
        // so we need to pick a number randomly here.
        notFinalIndex = Math.floor(Math.random() * obj.length)
        this.dataStore.setNotFinalIndex(notFinalIndex)
        this.state.notFinalIndex = notFinalIndex
      }
      obj = obj[notFinalIndex]
    }

    if (Array.isArray(prevObj)) {
      prevNotFinal = true
      prevObj.forEach(item => voteIds.push(item.voteId))
      prevObj = prevObj[notFinalIndex]
      notFinalizedObj = true
    }
    // console.log('ID IS: ', id)
    // console.log('current obj: ')
    // console.log(obj)
    // console.log('prev obj: ')
    // console.log(prevObj)

    if (obj !== null && has.call(obj, 'doesNotExist')) {
      objectExists = false
    } else if (obj !== null && has.call(obj, 'badError')) {
      badError = true
    }

    if (id !== '.' && has.call(prevObj, 'voteId')) {
      effectDoneBefore = this.dataStore.isEffectDone(prevId, prevObj.voteId)
    } else {
      effectDoneBefore = this.dataStore.isEffectDone(prevId, '.')
    }

    if (prevObj) {
      if (prevObj[selection].effect === 'NONE') effectDone = true
      if (prevObj[selection].effect === 'MERCHANT') effectDone = true
    } else if (id === '.') {
      effectDone = true
    }

    if (effectDoneBefore) {
      effectDone = true
    }

    return (
      <Transition onHide={this.onHide} animation="scale" transitionOnMount visible={visible} duration={this.transitionDuration}>
        <Grid style={{ marginTop: '0rem' }} verticalAlign="middle" columns={1} centered>
          <PathID badError={badError} dataStore={this.dataStore} currentVoteIndex={notFinalIndex} votes={voteIds} refresh={this.refreshCallback} notFinalized={notFinalizedObj} exists={objectExists} callback={this.toggleRestartModal} modalOpen={restartModalOpen} id={id} />
          <PathImg img={id === '.' ? obj.image : prevObj[selection].image} />
          <PathText text={id === '.' ? obj.text : prevObj[selection].text} />
          {(id === '.' || prevObj[selection].effect === 'NONE') ? null
            : <PathEffect key={id} id={id} notFinalized={prevNotFinal} doneBefore={effectDoneBefore} dataStore={this.dataStore} callback={this.effectDoneCallback} effect={prevObj[selection].effect} />
          }
          {/* {id === '.' ? null : <div>EFFECT: {prevObj[selection].effect}</div>}
          {notFinalizedObj && <div>THIS OBJ IS NOT FINALIZED YET</div>} */}
          <PathChoices id={id} dataStore={this.dataStore} badError={badError} notFinalized={notFinalizedObj} exists={objectExists} display={effectDone} callback={this.handlePathChoice} obj={obj} />
        </Grid>
      </Transition>
    )
  }
}

Path.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
