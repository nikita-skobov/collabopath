import React, { Component } from 'react'
import { Header } from 'semantic-ui-react'
import PropTypes from 'prop-types'

import { PathEffect as pathEffectVars, MakePath as makePathVars } from '../dynamicVars'
import Slot from './Slot'
import FoundItemSlot from './FoundItemSlot'
import Merchant from './Merchant'

export default class PathEffect extends Component {
  constructor(props) {
    // console.log('CONSTRUCTING PATH EFFECT')
    super(props)
    this.effect = props.effect
    this.dataStore = props.dataStore
    this.callback = props.callback
    this.doneBefore = props.doneBefore
    this.notFinalized = props.notFinalized
    this.id = props.id

    this.isConditional = false
    this.effectOutcome = null
    this.effectPassed = false
    this.itemFoundName = null

    this.state = {
      open: (this.effect !== 'NONE'), // only open modal if the effect is different than NONE
      effectDone: false || this.doneBefore,
      val: null,
      merchantJustKilled: false, // special case. if the merchant was active
      // but then killed, use this to immediately render a message about how you got his items...
    }

    this.numMerchantItems = pathEffectVars.numberOfMerchantItems
    if (this.effect === 'MERCHANT') {
      const items = this.dataStore.getMerchantItems()
      if (items) {
        this.merchantItems = items
      } else {
        this.merchantItems = pathEffectVars.chooseMerchantItems(this.numMerchantItems)
        this.dataStore.setMerchantItems(this.merchantItems)
      }
    }

    this.merchantWasKilled = this.merchantWasKilled.bind(this)
    this.onModalClose = this.onModalClose.bind(this)
    this.slotDone = this.slotDone.bind(this)

    this.dataStore.rememberMe('PathEffect', this)
  }

  onModalClose() {
    const { effectDone } = this.state
    if (effectDone) {
      this.setState({ open: false })
    }
  }

  slotDone(s, val) {
    let amount = val

    if (this.effect === 'FOUND_ITEM' || this.effectOutcome === 'FOUND_ITEM') {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.effectDone = true
        this.itemFoundName = val
        this.dataStore.buyItem(val, 0)
        return tempState
      }, () => {
        this.callback()
      })
    } else if (this.isConditional) {
      const { statName, dir } = pathEffectVars.getStatAndDir(this.effectOutcome)
      if (dir === 'down') amount = -amount
      this.dataStore.tell('GameBar').changeStat(statName.toLowerCase(), amount, () => {
        this.callback()
        this.setState({ effectDone: true, val })
      })
    } else {
      const { statName, dir } = pathEffectVars.getStatAndDir(this.effect)
      if (dir === 'down') amount = -amount
      this.dataStore.tell('GameBar').changeStat(statName.toLowerCase(), amount, () => {
        this.callback()
        this.setState({ effectDone: true, val })
      })
    }
  }

  merchantWasKilled() {
    this.setState({ merchantJustKilled: true })
  }

  render() {
    // if (this.dataStore.isNewConcept('effect')) {
    //   this.dataStore.setActiveConcept('effect')
    //   this.dataStore.tell('App').newConceptModal('effect')
    //   this.dataStore.conceptDone('effect')
    // }

    const { effectDone, val, merchantJustKilled } = this.state
    this.isConditional = pathEffectVars.isConditionalEffect(this.effect)
    const header = pathEffectVars.getEffectHeader(this.effect)

    if (this.notFinalized) {
      let passEffect
      let failEffect
      if (this.isConditional) {
        try {
          passEffect = this.effect.substring(this.effect.indexOf(')') + 1, this.effect.length)
          if (passEffect.includes(':')) {
            passEffect = this.effect.substring(this.effect.indexOf(')') + 1, this.effect.indexOf(':'))
          }
        } catch (e) {
          passEffect = ''
        }
        try {
          failEffect = pathEffectVars.getEffectOutcome(false, this.effect)
          if (failEffect.includes('(')) failEffect = ''
        } catch (e) {
          failEffect = ''
        }
        if (passEffect !== '') passEffect = makePathVars.getTextFromName(passEffect)
        if (failEffect !== '') failEffect = makePathVars.getTextFromName(failEffect)
      }
      if (!effectDone) {
        setTimeout(() => {
          this.setState({ effectDone: true }, () => {
            // this allows the path choice buttons to be rendered
            // without changing any of the effect data in the dataStore
            // by default this.callback() is called with null
            this.callback(true)
          })
        }, 1000)
      }

      return (
        <div>
          <Header style={{ marginBottom: '0' }}>This object is not finalized yet, so the effect wont be applied</Header>
          <Header as="h2">{!this.isConditional && 'Effect:'} {header}</Header>
          {this.isConditional && (passEffect !== '' || failEffect !== '') && (
            <Header as="h2">{passEffect !== '' && `If it passes: ${passEffect}. `} {failEffect !== '' && `If it fails: ${failEffect}`}</Header>
          )}
        </div>
      )
    }

    if (this.doneBefore) {
      return (
        <Header style={{ marginBottom: '0' }} as="h2">
          Effect: {header} has already been applied
        </Header>
      )
    }

    if (this.isConditional) {
      let { effectPassed } = this

      if (!effectDone) {
        if (this.dataStore.isConditionCalculated(this.id)) {
          effectPassed = this.dataStore.getConditionCalculation(this.id)
          this.effectPassed = effectPassed
          this.effectOutcome = pathEffectVars.getEffectOutcome(effectPassed, this.effect)
        } else {
          effectPassed = pathEffectVars.didEffectPass(this.effect, this.dataStore)
          this.effectPassed = effectPassed
          // console.log(`EFFECT PASSED? ${effectPassed}`)
          this.effectOutcome = pathEffectVars.getEffectOutcome(effectPassed, this.effect)
          if (this.effectOutcome === 'MERCHANT') {
            this.dataStore.setConditionalCalculatedAt(this.id, effectPassed)
          }
          // console.log(`effect outcome? ${this.effectOutcome}`)
        }
      }
      const { statName, dir } = pathEffectVars.getStatAndDir(this.effectOutcome)
      const { max, min } = pathEffectVars.getMaxMin(statName)

      if (this.effectOutcome === 'FOUND_ITEM') {
        return (
          <div>
            <Header as="h2">{header}</Header>
            <Header as="h2">Condtional effect {effectPassed ? 'passed!' : 'failed!'}</Header>
            {effectDone ? (
              <Header  as="h2"> Found {this.itemFoundName}</Header>
            ) : (
              <FoundItemSlot callback={this.slotDone} stopSpinThreshold={150} spinFactor={0.055} spinSpeed={10} />
            )}
          </div>
        )
      }

      if (merchantJustKilled) {
        return (
          <Header as="h2">
            You killed the merchant! You feel bad for a moment, but then you pick up all the cool goodies that were dropped, and you feel better about yourself.
          </Header>
        )
      }

      if (this.effectOutcome === 'MERCHANT') {
        const items = this.dataStore.getMerchantItems()
        if (items) {
          this.merchantItems = items
        } else {
          this.merchantItems = pathEffectVars.chooseMerchantItems(this.numMerchantItems)
          this.dataStore.setMerchantItems(this.merchantItems)
        }

        if (!effectDone) {
          setTimeout(() => {
            this.setState({ effectDone: true }, () => {
              this.callback(true)
            })
          }, 1000)
        }

        if (this.dataStore.merchantIsAlive()) {
          // tell gamebar that you can sell items
          this.dataStore.tell('GameBar').merchantIsHere(true)
          return (
            <div>
              <Header as="h2">{header}</Header>
              <Header as="h2">Condtional effect {effectPassed ? 'passed!' : 'failed!'}</Header>
              <Merchant dataStore={this.dataStore} items={this.merchantItems} />
            </div>
          )
        }
        return (
          <div>
            <Header as="h2">Effect: A merchant would have appeared, but you killed the merchant earlier... Now you get nothing!</Header>
          </div>
        )
      }

      if (this.effectOutcome === 'NONE') {
        if (!effectDone) {
          setTimeout(() => {
            this.setState({ effectDone: true }, () => {
              this.callback()
            })
          }, 1000)
        }
        return (
          <div>
            <Header as="h2">{header}</Header>
            <Header as="h2">Condtional effect {effectPassed ? 'passed!' : 'failed!'}</Header>
            <Header as="h2">Nothing Happened</Header>
          </div>
        )
      }

      return (
        <div>
          <Header as="h2">{header}</Header>
          <Header as="h2">Condtional effect {effectPassed ? 'passed!' : 'failed!'}</Header>
          {effectDone ? (
            <Header style={{ color: dir === 'down' ? '#db2828' : '#00801e' }} as="h2">
              {statName} went {dir} by {val}
            </Header>
          ) : (
            <Header style={{ color: dir === 'down' ? '#db2828' : '#00801e' }} as="h2">
              {statName} is going {dir} by
              <Slot animation max={max} min={min} callback={this.slotDone} stopSpinThreshold={50} spinFactor={0.035} />
            </Header>
          )}
        </div>
      )
    }

    const { statName, dir } = pathEffectVars.getStatAndDir(this.effect)
    const { max, min } = pathEffectVars.getMaxMin(statName)

    if (merchantJustKilled) {
      return (
        <Header as="h2">
          You killed the merchant! You feel bad for a moment, but then you pick up all the cool goodies that were dropped, and you feel better about yourself.
        </Header>
      )
    }

    if (this.effect === 'MERCHANT') {
      if (this.dataStore.merchantIsAlive()) {
        return (
          <div>
            <Header as="h2">Effect: {header}</Header>
            <Merchant dataStore={this.dataStore} items={this.merchantItems} />
          </div>
        )
      }
      return (
        <div>
          <Header as="h2">Effect: A merchant would have appeared, but you killed the merchant earlier... Now you get nothing!</Header>
        </div>
      )
    }

    if (this.effect === 'FOUND_ITEM') {
      return (
        <div>
          <Header as="h2">Effect: {header}</Header>
          {effectDone ? (
            <Header as="h2"> Found {this.itemFoundName}</Header>
          ) : (
            <FoundItemSlot callback={this.slotDone} stopSpinThreshold={150} spinFactor={0.055} spinSpeed={10} />
          )}
        </div>
      )
    }

    if (this.effect === 'GOLD') {
      return (
        <div>
          <Header as="h2">Effect: {header}</Header>
          {effectDone ? (
            <Header style={{ color: '#ffd600' }} as="h2">
              found {val} gold!
            </Header>
          ) : (
            <Header style={{ color: '#ffd600' }} as="h2">
              Gold is going up by
              <Slot animation max={max} min={min} callback={this.slotDone} stopSpinThreshold={50} spinFactor={0.035} />
            </Header>
          )}
        </div>
      )
    }

    return (
      <div>
        <Header as="h2">Effect: {header}</Header>
        {effectDone ? (
          <Header style={{ color: dir === 'down' ? '#db2828' : '#00801e' }} as="h2">
            {statName} went {dir} by {val}
          </Header>
        ) : (
          <Header style={{ color: dir === 'down' ? '#db2828' : '#00801e' }} as="h2">
            {statName} is going {dir} by
            <Slot animation max={max} min={min} callback={this.slotDone} stopSpinThreshold={50} spinFactor={0.035} />
          </Header>
        )}
      </div>
    )
  }
}

PathEffect.propTypes = {
  effect: PropTypes.string.isRequired,
  dataStore: PropTypes.func.isRequired,
  callback: PropTypes.func.isRequired,
  doneBefore: PropTypes.bool.isRequired,
  notFinalized: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
}
