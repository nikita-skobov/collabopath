import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Transition,
  Grid,
  Container,
  Header,
  Form,
} from 'semantic-ui-react'

import Slot from './Slot'
import ChooseStartingItem from './ChooseStartingItem'
import StatAllocate from './StatAllocate'
import Path from './Path'
import { PathViewer as pathViewerVars } from '../dynamicVars'

export default class PathViewer extends Component {
  constructor(props) {
    // console.log('CONSTRUCTING PATH VIEWER')
    super(props)
    
    this.dataStore = props.dataStore

    let stage = this.dataStore.getStage()
    if (typeof stage === 'string' && stage.includes('.') && stage !== '.') {
      stage = stage.substr(1, stage.length - 1)
      stage = parseInt(stage, 10)
    }

    this.state = {
      stage,
      visible: true,
      inputVisible: true,
    }
    
    this.transitionDuration = pathViewerVars.outerTransitionDuration
    this.innerTransitionDuration = pathViewerVars.innerTransitionDuration
    this.inputValue = null
    
    this.formSubmit = this.formSubmit.bind(this)
    this.onHideInner = this.onHideInner.bind(this)
    this.onHideOuter = this.onHideOuter.bind(this)
    
    const {
      healthMax,
      healthMin,
      intelligenceMax,
      intelligenceMin,
      sanityMax,
      sanityMin,
      staminaMax,
      staminaMin,
    } = pathViewerVars
    
    this.stages = {
      0: {
        question: 'What is your name?',
        element: (<input style={{ textAlign: 'center', width: '100%' }} type="text" placeholder="Enter name here" />),
      },
      1: {
        question: 'Allocate your stats',
        element: (<StatAllocate key="1" dataStore={this.dataStore} callback={this.formSubmit} />),
      },
      2: {
        question: 'Now calculating your characters intelligence',
        element: (<Slot animation key="2" transitionDuration={this.innerTransitionDuration} callback={this.formSubmit} max={intelligenceMax} min={intelligenceMin} />),
      },
      3: {
        question: 'Now resolving your characters sanity',
        element: (<Slot animation key="3" transitionDuration={this.innerTransitionDuration} callback={this.formSubmit} max={sanityMax} min={sanityMin} />),
      },
      4: {
        question: 'Now deciding your characters stamina',
        element: (<Slot animation key="4" transitionDuration={this.innerTransitionDuration} callback={this.formSubmit} max={staminaMax} min={staminaMin} />),
      },
      5: {
        question: 'Choose your starting item',
        element: (<ChooseStartingItem callback={this.formSubmit} />),
      },
    }
  }

  shouldComponentUpdate() {
    // only update if merchant, or effect concept modal is not active
    if (this.dataStore.isConceptActive('merchant')) return false
    if (this.dataStore.isConceptActive('effect')) return false
    return true
  }

  onHideInner() {
    // this gets called when the inner transition fades away (the input bounces up)
    // when it finishes, we set visible to false, causing the component to re-render
    // but this time the outter transition element fades out instead of fading in.
    const { stage } = this.state
    const callback = this.dataStore.tell('App').changeGameBarState
    if (stage === 0) {
      if (this.inputValue === '') {
        this.inputValue = pathViewerVars.defaultName
      } else if (!/\S/.test(this.inputValue)) {
        // it doesnt contain any characters
        this.inputValue = pathViewerVars.defaultName
      }
      callback({
        type: 'name',
        val: this.inputValue,
      })
    } else if (stage === 1) {
      callback({
        type: 'int',
        val: this.inputValue.intelligence,
      })
      callback({
        type: 'san',
        val: this.inputValue.sanity,
      })
      callback({
        type: 'stm',
        val: this.inputValue.stamina,
      })
      callback({
        type: 'health',
        val: this.inputValue.health,
      })
    } else if (stage === 2) {
      callback({
        type: 'int',
        val: this.inputValue,
      })
    } else if (stage === 3) {
      callback({
        type: 'san',
        val: this.inputValue,
      })
    } else if (stage === 4) {
      callback({
        type: 'stm',
        val: this.inputValue,
      })
    } else if (stage === 5) {
      callback({
        type: 'inventory',
        val: this.inputValue,
      })
    }
    this.setState({ visible: false })
  }
  

  onHideOuter() {
    // this gets called when the outer transition fades away
    // upon finishing fading away, we should increment the state to render the next
    // question/input, and reset the visible flags.
    this.setState((prevState) => {
      let { stage } = prevState
      stage += 1
      if (stage === 2) {
        stage = 5
      }
      if (stage === 6) {
        stage = '.'
      }
      this.dataStore.setStage(stage)
      return { stage, visible: true, inputVisible: true }
    })
  }

  formSubmit(e, item) {
    const { stage } = this.state
    if (stage === 0) {
      const val = e.target.children[0].children[0].value
      this.inputValue = val
      this.setState({ inputVisible: false })
    } else {
      this.inputValue = item
      this.onHideInner()
    }
  }


  render() {
    const { stage, visible, inputVisible } = this.state
    if (typeof stage === 'number') {
      return (
        <div>
          <Transition onHide={this.onHideOuter} animation="scale" transitionOnMount visible={visible} duration={this.transitionDuration}>
            <Grid style={{ marginTop: '25vh' }} verticalAlign="middle" columns={1} centered>
              <Grid.Column>
                <Grid.Row />
                <Grid.Row>
                  <Container textAlign="center" fluid>
                    <Header as="h1">
                      {this.stages[stage].question}
                    </Header>
                    <Form onSubmit={this.formSubmit}>
                      <div className="ui massive focus transparent input">
                        <Transition onHide={this.onHideInner} animation="fly down" visible={inputVisible} duration={this.innerTransitionDuration}>
                          {this.stages[stage].element}
                        </Transition>
                      </div>
                    </Form>
                  </Container>
                </Grid.Row>
                <Grid.Row />
              </Grid.Column>
            </Grid>
          </Transition>
        </div>
      )
    }
    return (
      <div>
        <Path dataStore={this.dataStore} />
      </div>
    )
  }
}

PathViewer.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
