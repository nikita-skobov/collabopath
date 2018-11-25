/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Modal,
  Button,
  Grid,
  Header,
  Input,
  TextArea,
  Image,
  Message,
  Loader,
  Dimmer,
  Step,
  Tab,
} from 'semantic-ui-react'

import {
  PathEffect as pathEffectVars,
  MakePath as makePathVars,
  Support as supportVars,
  allowedItems,
  allowedImages,
  isValidEffect,
  isValidImage,
  imageCategories,
  containsBadWords,
} from '../dynamicVars'

const PathImg = (props) => {
  const { img } = props
  return (
    <div className="db">
      <img src={img} style={{ maxWidth: '100%', marginTop: '0.3rem', marginLeft: 'auto', marginRight: 'auto' }} alt="some text" />
    </div>
  )
}

PathImg.propTypes = {
  img: PropTypes.string.isRequired,
}

const PathText = (props) => {
  const { text } = props
  return (
    <Header style={{ maxWidth: '90%', margin: '1% auto 1%', wordBreak: 'break-word' }} as="h1" size="large">
      {text}
    </Header>
  )
}

PathText.propTypes = {
  text: PropTypes.string.isRequired,
}

const ImageChoices = (props) => {
  const { choices, src, callback, ind } = props
  if (choices.length === 0) {
    return [
      <Grid.Row style={{ height: '20px' }} />,
      <Grid.Row>
        <Header as="h4">Sorry, there are no items in this category yet</Header>
      </Grid.Row>,
    ]
  }
  return choices.map((imgSrc, index) => {
    if (index % 2 === 0) {
      if (choices[index + 1] !== undefined) {
        const imgSrc2 = choices[index + 1]
        return (
          <Grid.Row>
            <Button color={imgSrc === src ? 'green' : null} compact style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} name={imgSrc} onClick={(a, b) => { callback(a, b, ind, null) }}>
              <Image size="medium" name={imgSrc} src={imgSrc} />
            </Button>
            <Button color={imgSrc2 === src ? 'green' : null} compact style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} name={imgSrc2} onClick={(a, b) => { callback(a, b, ind, null) }}>
              <Image size="medium" name={imgSrc2} src={imgSrc2} />
            </Button>
          </Grid.Row>
        )
      }
      return (
        <Grid.Row>
          <Button color={imgSrc === src ? 'green' : null} compact style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} name={imgSrc} onClick={(a, b) => { callback(a, b, ind, null) }}>
            <Image size="medium" name={imgSrc} src={imgSrc} />
          </Button>
        </Grid.Row>
      )
    }
    return null
  })
}
ImageChoices.propTypes = {
  ind: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
  choices: PropTypes.instanceOf(Array).isRequired,
  src: PropTypes.string.isRequired,
}

const MyContent = (props) => {
  const {
    ind,
    callback,
    data,
    metaData,
  } = props
  const rowSmall = { width: '92%' }

  if (ind === 0) {
    const { profanity } = metaData
    return (
      <Grid centered columns={2}>
        <Grid.Row>
          <Header style={rowSmall} as="h2">First step: Pick your path choices</Header>
        </Grid.Row>
        {profanity && (
          <Grid.Row>
            <Header as="h3" color="red" style={rowSmall}>Please remove the profanity.</Header>
          </Grid.Row>
        )}
        <Grid.Row>
          <Input value={data.choiceL.q} maxLength={makePathVars.maxQuestionLength} name={ind} onChange={(a, b) => { callback(a, b, ind) }} placeholder="Left Choice" />
          <Input value={data.choiceR.q} maxLength={makePathVars.maxQuestionLength} name={ind} onChange={(a, b) => { callback(a, b, ind) }} placeholder="Right Choice" />
        </Grid.Row>
      </Grid>
    )
  }
  if (ind === 1) {
    return (
      <Grid centered columns={2}>
        <Grid.Row>
          <Header style={rowSmall} as="h2">Your buttons will look like this: </Header>
        </Grid.Row>
        <Grid.Row>
          <Button disabled>{data.choiceL.q}</Button>
          <Button disabled>{data.choiceR.q}</Button>
        </Grid.Row>
      </Grid>
    )
  }
  if (ind === 2 || ind === 6) {
    const direction = ind === 2 ? 'left' : 'right'
    const choice = ind === 2 ? 'choiceL' : 'choiceR'
    const { profanity } = metaData
    return (
      <Grid centered columns={1}>
        <Grid.Row>
          <Header style={rowSmall} as="h3">This is the text that will show up after the user clicks the {`'${data[choice].q}'`} button</Header>
        </Grid.Row>
        {profanity && (
          <Grid.Row>
            <Header style={rowSmall} color="red" as="h3">Please remove the profanity.</Header>
          </Grid.Row>
        )}
        <Grid.Row>
          <TextArea maxLength={makePathVars.maxTextLength} rows={8} style={{ width: '80%' }} autoHeight onChange={(a, b) => { callback(a, b, ind) }} placeholder="Continue the story..." />
        </Grid.Row>
      </Grid>
    )
  }
  if (ind === 3 || ind === 7) {
    const direction = ind === 3 ? 'left' : 'right'
    const { effectType, conditionalType, itemName, passName, failName } = metaData
    const choice = ind === 3 ? 'choiceL' : 'choiceR'
    const isConditional = pathEffectVars.isConditionalEffect(data[choice].effect)
    const header = pathEffectVars.getEffectHeader(data[choice].effect)
    let passEffect
    let failEffect
    try {
      const { effect } = data[choice]
      passEffect = effect.substring(effect.indexOf(')') + 1, effect.length)
      if (passEffect.includes(':')) {
        passEffect = effect.substring(effect.indexOf(')') + 1, effect.indexOf(':'))
      }
    } catch (e) {
      passEffect = ''
    }
    try {
      failEffect = pathEffectVars.getEffectOutcome(false, data[choice].effect)
      if (failEffect.includes('(')) failEffect = ''
    } catch (e) {
      failEffect = ''
    }
    if (passEffect !== '') passEffect = makePathVars.getTextFromName(passEffect)
    if (failEffect !== '') failEffect = makePathVars.getTextFromName(failEffect)
    return (
      <Grid centered columns={1}>
        <Grid.Row>
          <Header style={rowSmall} as="h3">
            This is the effect that will be applied to the user after the user clicks the {`'${data[choice].q}'`} button. Keep in mind that you get to choose the TYPE of effect, but not the amount that something changes. For example, if you choose the Gold effect, the user will find a random amount of gold. You do not get to decide how much they find.
          </Header>
        </Grid.Row>
        <Grid.Row>
          <Header style={rowSmall} name={ind} as="h3">{!isConditional && 'Your effect:'} {header}</Header>
        </Grid.Row>
        {isConditional && (passEffect !== '' || failEffect !== '') && (
          <Grid.Row>
            <Header style={rowSmall} as="h3">{passEffect !== '' && `If it passes: ${passEffect}. `} {failEffect !== '' && `If it fails: ${failEffect}`}</Header>
          </Grid.Row>
        )}
        <Grid.Row>
          <Button.Group>
            <Button onClick={(a, b) => { callback(a, b, 'basic') }} color="blue">Basic Effects</Button>
            <Button.Or />
            <Button onClick={(a, b) => { callback(a, b, 'conditional') }} color="blue">Conditional Effects</Button>
          </Button.Group>
        </Grid.Row>
        {effectType === 'basic' && (
          <Grid.Row>
            <Grid style={{ paddingLeft: '0', paddingRight: '0' }} doubling centered columns={2}>
              {makePathVars.effects.map((effect, index) => {
                if (index % 2 === 0) { // so that we can group every 2 effects into one row
                  if (makePathVars.effects[index + 1] !== undefined) {
                    const effect2 = makePathVars.effects[index + 1]
                    return (
                      <Grid.Row className="pv1rem">
                        <Button className="w50" color={effect.name === data[choice].effect ? 'green' : ''} onClick={(a, b) => { callback(a, b, ind) }} name={effect.name}>{effect.text}</Button>
                        <Button className="w50" color={effect2.name === data[choice].effect ? 'green' : ''} onClick={(a, b) => { callback(a, b, ind) }} name={effect2.name}>{effect2.text}</Button>
                      </Grid.Row>
                    )
                  }
                  // weve reached the last element, and it doesnt have a partner
                  // render it in a row by itself
                  return (
                    <Grid.Row className="pv1rem">
                      <Button className="w50" color={effect.name === data[choice].effect ? 'green' : ''} onClick={(a, b) => { callback(a, b, ind) }} name={effect.name}>{effect.text}</Button>
                    </Grid.Row>
                  )
                }
                return null
              })}
            </Grid>
          </Grid.Row>
        )}
        {effectType === 'conditional' && (
          <Grid centered columns={1}>
            <Grid.Row>
              <Header style={rowSmall} as="h3">There are 2 types of conditional effects: a HAS effect, and a CHECK effect. A HAS effect is used to see if a user has a certain item. A CHECK effect is used to check if a users stats, like their health, or stamina, are high enough. The way both of these effects work is if the test passes, the PASS condition gets applied. If the test fails, then the FAIL condition gets applied.</Header>
            </Grid.Row>
            <Grid.Row>
              <Header style={rowSmall} as="h3">What kind of conditional effect would you like?</Header>
            </Grid.Row>
            <Grid.Row>
              <Button color={conditionalType === 'has' && 'green'} onClick={(a, b) => { callback(a, b, 'has') }}>HAS effect</Button>
              <Button color={conditionalType === 'check' && 'green'} onClick={(a, b) => { callback(a, b, 'check') }}>CHECK effect</Button>
            </Grid.Row>
            {(conditionalType === 'has' && itemName === '') ? (
              <Grid centered columns={1}>
                <Grid.Row>
                  <Header style={rowSmall} as="h3">Which item do you want to see if the user has?</Header>
                </Grid.Row>
                <Grid centered doubling columns={2}>
                  {allowedItems.map((item, index) => {
                    if (index % 2 === 0) {
                      if (allowedItems[index + 1] !== undefined) {
                        const item2 = allowedItems[index + 1]
                        return (
                          <Grid.Row>
                            <Button compact style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} name={item.name} onClick={(a, b) => { callback(a, b, ind, 'has') }}>
                              <Image size="medium" name={item.name} src={item.src} />
                            </Button>
                            <Button compact style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} name={item2.name} onClick={(a, b) => { callback(a, b, ind, 'has') }}>
                              <Image size="medium" name={item2.name} src={item2.src} />
                            </Button>
                          </Grid.Row>
                        )
                      }
                      return (
                        <Grid.Row>
                          <Button compact style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} name={item.name} onClick={(a, b) => { callback(a, b, ind, 'has') }}>
                            <Image size="medium" name={item.name} src={item.src} />
                          </Button>
                        </Grid.Row>
                      )
                    }
                    return null
                  })}
                </Grid>
              </Grid>
            ) : (conditionalType === 'has' && passName === '') ? (
              <Grid style={{ paddingLeft: '0', paddingRight: '0' }} centered columns={1}>
                <Grid.Row>
                  <Header style={rowSmall} as="h3"> What should happen if the user has item: {itemName}?</Header>
                </Grid.Row>
                <Grid style={{ paddingLeft: '0', paddingRight: '0' }} doubling centered columns={2}>
                  {makePathVars.effects.map((effect, index) => {
                    if (index % 2 === 0) { // so that we can group every 2 effects into one row
                      if (makePathVars.effects[index + 1] !== undefined) {
                        const effect2 = makePathVars.effects[index + 1]
                        return (
                          <Grid.Row className="pv1rem">
                            <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'has2') }} name={effect.name}>{effect.text}</Button>
                            <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'has2') }} name={effect2.name}>{effect2.text}</Button>
                          </Grid.Row>
                        )
                      }
                      // weve reached the last element, and it doesnt have a partner
                      // render it in a row by itself
                      return (
                        <Grid.Row className="pv1rem">
                          <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'has2') }} name={effect.name}>{effect.text}</Button>
                        </Grid.Row>
                      )
                    }
                    return null
                  })}
                </Grid>
              </Grid>
            ) : (conditionalType === 'has' && failName === '') ? (
              <Grid style={{ paddingLeft: '0', paddingRight: '0' }} centered columns={1}>
                <Grid.Row>
                  <Header style={rowSmall} as="h3"> So if the user has: {itemName} then: {passName}. What should happen if they dont have {itemName}?</Header>
                </Grid.Row>
                <Grid style={{ paddingLeft: '0', paddingRight: '0' }} doubling centered columns={2}>
                  {makePathVars.effects.map((effect, index) => {
                    if (index % 2 === 0) { // so that we can group every 2 effects into one row
                      if (makePathVars.effects[index + 1] !== undefined) {
                        const effect2 = makePathVars.effects[index + 1]
                        return (
                          <Grid.Row className="pv1rem">
                            <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'has3') }} name={effect.name}>{effect.text}</Button>
                            <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'has3') }} name={effect2.name}>{effect2.text}</Button>
                          </Grid.Row>
                        )
                      }
                      // weve reached the last element, and it doesnt have a partner
                      // render it in a row by itself
                      return (
                        <Grid.Row className="pv1rem">
                          <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'has3') }} name={effect.name}>{effect.text}</Button>
                        </Grid.Row>
                      )
                    }
                    return null
                  })}
                </Grid>
              </Grid>
            ) : (conditionalType === 'has') && (
              <Grid centered columns={1}>
                <Grid.Row>
                  <Header style={rowSmall} as="h3">Your conditional effect: Does the user have {itemName}? If they do: {passName}, or if they dont: {failName}</Header>
                </Grid.Row>
                <Grid.Row>
                  <Header style={rowSmall} as="h3">If you are satisfied with this effect, click Next, otherwise click one of the buttons above to redo your effect.</Header>
                </Grid.Row>
              </Grid>
            )}
            {(conditionalType === 'check' && itemName === '') ? (
              <Grid style={{ paddingLeft: '0', paddingRight: '0' }} centered columns={1}>
                <Grid.Row>
                  <Header style={rowSmall} as="h3"> The way that a check effect works is the game checks if a users stat attribute is higher than a random number. For example: if the stat is STAMINA and the users STAMINA is at 50, and the random number happens to be 55, then the effect fails because the users STAMINA is not higher than 55.</Header>
                </Grid.Row>
                <Grid.Row>
                  <Header style={rowSmall} as="h3">Which stat do you want to check?</Header>
                </Grid.Row>
                <Grid style={{ paddingLeft: '0', paddingRight: '0' }} centered doubling columns={2}>
                  {makePathVars.stats.map((item, index) => {
                    if (index % 2 === 0) {
                      if (makePathVars.stats[index + 1] !== undefined) {
                        const item2 = makePathVars.stats[index + 1]
                        return (
                          <Grid.Row className="pv1rem">
                            <Button className="w50" name={item.name} onClick={(a, b) => { callback(a, b, ind, 'check') }}>{item.text}</Button>
                            <Button className="w50" name={item2.name} onClick={(a, b) => { callback(a, b, ind, 'check') }}>{item2.text}</Button>
                          </Grid.Row>
                        )
                      }
                      return (
                        <Grid.Row className="pv1rem">
                          <Button className="w50" name={item.name} onClick={(a, b) => { callback(a, b, ind, 'check') }}>{item.text}</Button>
                        </Grid.Row>
                      )
                    }
                    return null
                  })}
                </Grid>
              </Grid>
            ) : (conditionalType === 'check' && passName === '') ? (
              <Grid style={{ paddingLeft: '0', paddingRight: '0' }} centered columns={1}>
                <Grid.Row>
                  <Header style={rowSmall} as="h3"> What should happen if the users {itemName} is high enough?</Header>
                </Grid.Row>
                <Grid style={{ paddingLeft: '0', paddingRight: '0' }} doubling centered columns={2}>
                  {makePathVars.effects.map((effect, index) => {
                    if (index % 2 === 0) { // so that we can group every 2 effects into one row
                      if (makePathVars.effects[index + 1] !== undefined) {
                        const effect2 = makePathVars.effects[index + 1]
                        return (
                          <Grid.Row className="pv1rem">
                            <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'check2') }} name={effect.name}>{effect.text}</Button>
                            <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'check2') }} name={effect2.name}>{effect2.text}</Button>
                          </Grid.Row>
                        )
                      }
                      // weve reached the last element, and it doesnt have a partner
                      // render it in a row by itself
                      return (
                        <Grid.Row className="pv1rem">
                          <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'check2') }} name={effect.name}>{effect.text}</Button>
                        </Grid.Row>
                      )
                    }
                    return null
                  })}
                </Grid>
              </Grid>
            ) : (conditionalType === 'check' && failName === '') ? (
              <Grid style={{ paddingLeft: '0', paddingRight: '0' }} centered columns={1}>
                <Grid.Row>
                  <Header style={rowSmall} as="h3"> So if the users {itemName} is high enough then: {passName}. What should happen if its not high enough?</Header>
                </Grid.Row>
                <Grid style={{ paddingLeft: '0', paddingRight: '0' }} doubling centered columns={2}>
                  {makePathVars.effects.map((effect, index) => {
                    if (index % 2 === 0) { // so that we can group every 2 effects into one row
                      if (makePathVars.effects[index + 1] !== undefined) {
                        const effect2 = makePathVars.effects[index + 1]
                        return (
                          <Grid.Row className="pv1rem">
                            <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'check3') }} name={effect.name}>{effect.text}</Button>
                            <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'check3') }} name={effect2.name}>{effect2.text}</Button>
                          </Grid.Row>
                        )
                      }
                      // weve reached the last element, and it doesnt have a partner
                      // render it in a row by itself
                      return (
                        <Grid.Row className="pv1rem">
                          <Button className="w50" onClick={(a, b) => { callback(a, b, ind, 'check3') }} name={effect.name}>{effect.text}</Button>
                        </Grid.Row>
                      )
                    }
                    return null
                  })}
                </Grid>
              </Grid>
            ) : (conditionalType === 'check') && (
              <Grid centered columns={1}>
                <Grid.Row>
                  <Header style={rowSmall} as="h3">Your conditional effect: Is the users {itemName} high enough? If it is: {passName}, or if its not: {failName}</Header>
                </Grid.Row>
                <Grid.Row>
                  <Header style={rowSmall} as="h3">If you are satisfied with this effect, click Next, otherwise click one of the buttons above to redo your effect.</Header>
                </Grid.Row>
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
    )
  }
  if (ind === 4 || ind === 8) {
    const choice = ind === 4 ? 'choiceL' : 'choiceR'
    const imgSrc = ind === 4 ? data.choiceL.image : data.choiceR.image

    const imgOpts = Object.keys(imageCategories).map((key) => {
      const menuItem = key.charAt(0).toUpperCase() + key.slice(1)

      return {
        menuItem,
        render: () => (
          <ImageChoices
            choices={imageCategories[key]}
            ind={ind}
            callback={callback}
            src={imgSrc}
          />),
      }
    })

    return (
      <Grid centered columns={1}>
        <Grid.Row>
          <Header style={rowSmall} as="h3">This image will show up after the user clicks the {`'${data[choice].q}'`} button</Header>
        </Grid.Row>
        <Grid centered doubling columns={2}>
          <Grid.Row>
            <Header className="mb2vh" style={rowSmall} as="h4"> Image Categories: </Header>
          </Grid.Row>
          <Grid.Row>
            <Header className="mb2vh" style={rowSmall} as="h4"> {`Don${"'"}t see any images you like?`} <a target="_blank" rel="noopener noreferrer" href={supportVars.patreon}>Check out my patreon</a> where patrons can add images to the game.</Header>
          </Grid.Row>
          <Grid.Row>
            <Tab menu={{ attached: false, tabular: false }} panes={imgOpts} />
          </Grid.Row>
        </Grid>
      </Grid>
    )
  }
  if (ind === 5 || ind === 9) {
    const direction = ind === 5 ? 'left' : 'right'
    const choice = ind === 5 ? 'choiceL' : 'choiceR'
    const isConditional = pathEffectVars.isConditionalEffect(data[choice].effect)
    const header = pathEffectVars.getEffectHeader(data[choice].effect)
    return (
      <Grid centered verticalAlign="middle" columns={1}>
        <PathImg img={data[choice].image} />
        <Grid.Row>
          <PathText text={data[choice].text} />
        </Grid.Row>
        <Grid.Row>
          <Header style={{ marginBottom: '0' }} as="h3">{!isConditional && 'Effect:'}{header}</Header>
        </Grid.Row>
        <Grid.Row>
          <Message>
            <Message.Header>If you are satisfied with this path object, {ind === 5 ? 'Click Next to define your other choice.' : 'Click Submit to upload your path object.'} Otherwise go back to make changes.</Message.Header>
          </Message>
        </Grid.Row>
      </Grid>
    )
  }
  if (ind === 10 || ind === 11 || ind === 12) {
    const { reason } = metaData
    return (
      <Grid centered verticalAlign="middle" column={1}>
        <Grid.Row>
          {ind === 10 && (
            <Header style={rowSmall} as="h2">Submitting Your Path Object</Header>
          )}
          {ind === 11 && (
            <Header style={rowSmall} as="h2">
              <Header.Content>Success!</Header.Content>
              <Header.Content>You can close this modal, and refresh the path object page to see your new addition.</Header.Content>
            </Header>
          )}
          {ind === 12 && (
            <Header style={rowSmall} as="h2">
              <Header.Content style={{ display: 'block' }}>Submission Failed</Header.Content>
              <Header.Content>Reason: {reason}</Header.Content>
            </Header>
          )}
        </Grid.Row>
        <Grid.Row style={{ height: '5em' }}>
          {ind === 10 && (
            <Dimmer active inverted>
              <Loader inline>Please Wait</Loader>
            </Dimmer>
          )}
        </Grid.Row>
      </Grid>
    )
  }
  return <div>at ind: {ind} </div>
}
MyContent.propTypes = {
  ind: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
  metaData: PropTypes.instanceOf(Object).isRequired,
}

export default class MakePath extends Component {
  constructor(props) {
    // console.log('CONSTRUCTING MAKEPATH')
    super(props)
    this.dataStore = props.dataStore
    this.btnMessage = props.btnMessage
    this.useCurrentId = props.useCurrentId
    this.id = props.id

    if (!this.useCurrentId) {
      this.id = this.dataStore.getPreviousStageAtId(this.id)
    }

    this.allowedToUpload = this.dataStore.allowedToUpload(this.id)

    this.state = {
      makePathModalOpen: false,
      ind: 0,
      metaData: {
        effectType: '',
        conditionalType: '',
        itemName: '',
        passName: '',
        failName: '',
        reason: '',
        profanity: false,
      },
    }

    this.pathObj = {
      choiceL: {
        q: '',
        text: '',
        image: '',
        effect: 'NONE',
      },
      choiceR: {
        q: '',
        text: '',
        image: '',
        effect: 'NONE',
      },
    }

    this.toggleModal = this.toggleModal.bind(this)
    this.handleNext = this.handleNext.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleServerResponse = this.handleServerResponse.bind(this)
  }

  toggleModal(e) {
    if (e.target.name === 'open') {
      this.setState({ makePathModalOpen: true })
    } else {
      this.allowedToUpload = this.dataStore.allowedToUpload(this.id)
      this.pathObj = {
        choiceL: {
          q: '',
          text: '',
          image: '',
          effect: 'NONE',
        },
        choiceR: {
          q: '',
          text: '',
          image: '',
          effect: 'NONE',
        },
      }
      this.setState((prevState) => {
        const tempState = prevState
        tempState.makePathModalOpen = false
        tempState.ind = 0
        tempState.metaData.effectType = ''
        tempState.conditionalType = ''
        tempState.itemName = ''
        tempState.passName = ''
        tempState.metaData.profanity = false
        tempState.failName = ''
        return tempState
      })
    }
  }

  handleServerResponse(err) {
    // console.log(err)
    this.setState((prevState) => {
      const tempState = prevState
      if (err) {
        tempState.ind = 12
        if (err.includes('reason: 6')) {
          tempState.metaData.reason = `You have already submitted a path object for path ID ${this.id}`
        } else if (err.includes('reason: 1')) {
          tempState.metaData.reason = `Path ID ${this.id} was just finalized! Refresh this path object page to see the winning object. You can upload your path object on the next path.`
        } else {
          tempState.metaData.reason = err
        }
      } else {
        tempState.ind = 11
      }
      return tempState
    })
  }

  handleNext(e) {
    e.preventDefault()
    const { name } = e.target
    this.setState((prevState) => {
      const tempState = prevState

      let containsProfanity = false

      if (tempState.ind === 0) {
        containsProfanity = containsBadWords(this.pathObj.choiceL.q) || containsBadWords(this.pathObj.choiceR.q)
      } else if (tempState.ind === 2) {
        containsProfanity = containsBadWords(this.pathObj.choiceL.text)
      } else if (tempState.ind === 6) {
        containsProfanity = containsBadWords(this.pathObj.choiceR.text)
      }

      if (containsProfanity) {
        tempState.metaData.profanity = true
        return tempState
      }

      if (tempState.ind === 9 && name === 'forward') {
        // submit to server
        // console.log('SUBMITTING')
        this.dataStore.addPathObj(this.id, this.pathObj, (err) => {
          this.handleServerResponse(err)
        })
      }
      tempState.ind = (name === 'forward') ? (tempState.ind + 1) : (tempState.ind - 1)

      tempState.metaData.effectType = ''
      tempState.metaData.conditionalType = ''
      tempState.metaData.itemName = ''
      tempState.metaData.passName = ''
      tempState.metaData.profanity = false
      tempState.metaData.failName = ''
      return tempState
    })
  }

  handleChange(e, obj, ind, type) {
    e.preventDefault()
    if (ind === 0) {
      if (obj.placeholder === 'Right Choice') this.pathObj.choiceR.q = obj.value
      if (obj.placeholder === 'Left Choice') this.pathObj.choiceL.q = obj.value
    } else if (ind === 2) {
      this.pathObj.choiceL.text = obj.value
    } else if (ind === 3 || ind === 7) {
      const { name, innerHTML } = e.target
      const choice = (ind === 3 ? 'choiceL' : 'choiceR')
      if (!type) {
        // a basic effect, just set the effect to the name of the button
        // and force update so user sees their selection show up in green
        this.pathObj[choice].effect = name
        this.forceUpdate()
      } else {
        this.setState((prevState) => {
          const tempState = prevState

          if (type === 'has' || type === 'check') {
            this.pathObj[choice].effect = `${type}(${name})`
            tempState.metaData.itemName = name
          } else if (type === 'has2' || type === 'check2') {
            this.pathObj[choice].effect = `${this.pathObj[choice].effect}${name}`
            tempState.metaData.passName = innerHTML
          } else if (type === 'has3' || type === 'check3') {
            this.pathObj[choice].effect = `${this.pathObj[choice].effect}:${name}`
            tempState.metaData.failName = innerHTML
          }
          return tempState
        })
      }
    } else if (ind === 4) {
      const { name } = e.target
      this.pathObj.choiceL.image = name
      this.forceUpdate()
    } else if (ind === 6) {
      this.pathObj.choiceR.text = obj.value
    } else if (ind === 8) {
      const { name } = e.target
      this.pathObj.choiceR.image = name
      this.forceUpdate()
    } else if (ind === 'basic' || ind === 'conditional') {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.metaData.effectType = ind
        tempState.metaData.conditionalType = ''
        tempState.metaData.itemName = ''
        tempState.metaData.passName = ''
        tempState.metaData.failName = ''
        return tempState
      })
    } else if (ind === 'has' || ind === 'check') {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.metaData.conditionalType = ind
        tempState.metaData.itemName = ''
        tempState.metaData.passName = ''
        tempState.metaData.failName = ''
        return tempState
      })
    } else if (type === 'close') {
      this.toggleModal({ target: { name: 'close' } })
    }
  }

  render() {
    const { makePathModalOpen, ind, metaData } = this.state
    let validEffect = true
    let validImage = true

    if (ind === 3) {
      validEffect = isValidEffect(this.pathObj.choiceL.effect)
    } else if (ind === 7) {
      validEffect = isValidEffect(this.pathObj.choiceR.effect)
    }

    if (ind === 4) {
      validImage = isValidImage(this.pathObj.choiceL.image)
    } else if (ind === 8) {
      validImage = isValidImage(this.pathObj.choiceR.image)
    }

    if (!this.allowedToUpload) {
      return (
        <Button color="green" disabled size="medium">You have already submitted a path object at path ID: {this.id}</Button>
      )
    }

    const leftOrRight = (ind > 1)
    const leftSteps = (ind > 1 && ind < 6)
    const rightSteps = (ind > 5)

    let leftButton = 'Left Button'
    let rightButton = 'Right Button'

    if (window.innerWidth < 400) {
      if (this.pathObj.choiceL.q.length < leftButton.length && this.pathObj.choiceR.q.length < rightButton.length) {
        leftButton = this.pathObj.choiceL.q
        rightButton = this.pathObj.choiceR.q
      }
    } else {
      leftButton = this.pathObj.choiceL.q
      rightButton = this.pathObj.choiceR.q
    }

    return (
      <Modal
        onClose={this.toggleModal}
        open={makePathModalOpen}
        closeOnDimmerClick={false}
        closeOnDocumentClick={false}
        trigger={<Button color="green" name="open" onClick={this.toggleModal} size="medium">{this.btnMessage}</Button>}
      >
        <Modal.Header>
          You are submitting a path object that will go into path Id: {this.id}
        </Modal.Header>
        {leftOrRight && (
          <Step.Group unstackable attached="top">
            <Step active={leftSteps} title={leftButton} />
            <Step active={rightSteps} title={rightButton} />
          </Step.Group>
        )}
        {leftOrRight && (
          <Step.Group attached="top">
            <Step active={ind === 2 || ind === 6} title="Define Text" />
            <Step active={ind === 3 || ind === 7} title="Choose Effect" />
            <Step active={ind === 4 || ind === 8} title="Choose Image" />
            <Step active={ind === 5 || ind === 9} title="Review" />
          </Step.Group>
        )}
        <Modal.Content style={{ overflowX: 'hidden' }}>
          <MyContent metaData={metaData} data={this.pathObj} callback={this.handleChange} ind={ind} />
        </Modal.Content>
        {ind < 10 ? (
          <Modal.Actions>
            <Button name="close" className="ml0" color="red" onClick={this.toggleModal} size="small"> Close </Button>
            {ind > 0 && <Button color="blue" className="ml01" name="back" onClick={this.handleNext}> Back</Button>}
            <Button color="blue" className="ml01" disabled={!validEffect || !validImage} name="forward" onClick={this.handleNext}>{ind === 9 ? 'Submit' : 'Next'}</Button>
          </Modal.Actions>
        ) : (ind > 10) ? (
          <Modal.Actions>
            <Button name="close" className="ml0" color="red" onClick={this.toggleModal} size="small"> Close </Button>
          </Modal.Actions>
        ) : (
          <Modal.Actions />
        )}
      </Modal>
    )
  }
}

MakePath.defaultProps = {
  useCurrentId: false,
}

MakePath.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
  btnMessage: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  useCurrentId: PropTypes.bool,
}
