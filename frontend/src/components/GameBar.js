import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Grid,
  Header,
  Button,
  Modal,
  Image,
  Label,
} from 'semantic-ui-react'

import { GameBar as gameBarVars, itemPrices } from '../dynamicVars'

export default class GameBar extends Component {
  constructor(props) {
    // console.log('CONSTRUCTING GAMEBAR')
    super(props)

    this.dataStore = props.dataStore

    this.state = {
      name: this.dataStore.getName(),
      health: this.dataStore.getHealth(),
      intelligence: this.dataStore.getIntelligence(),
      sanity: this.dataStore.getSanity(),
      stamina: this.dataStore.getStamina(),
      inventory: this.dataStore.getInventory(),
      modalOpen: false,
      useItemModal: false,
      useItemMessage: '',
      merchantSpecialCase: false,
    }

    this.inventoryCells = [...Array(gameBarVars.inventoryCellCount).keys()]
    this.inventoryItems = gameBarVars.inventoryItems
    this.priceReduction = gameBarVars.priceReduction
    this.itemPrices = itemPrices

    this.columnStyle = {
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      // position: 'relative',
    }

    this.headerStyle = {
      position: 'relative',
      top: '50%',
      transform: 'translate(0, -45%)',
      flexGrow: '0',
    }

    this.getItemPrice = this.getItemPrice.bind(this)
    this.updateFunction = this.updateFunction.bind(this)
    this.fillInventoryCell = this.fillInventoryCell.bind(this)
    this.findItemByName = this.findItemByName.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.changeStat = this.changeStat.bind(this)
    this.findInventoryItemByName = this.findInventoryItemByName.bind(this)
    this.dropItem = this.dropItem.bind(this)
    this.useItem = this.useItem.bind(this)
    this.sellItem = this.sellItem.bind(this)
    this.buyItem = this.buyItem.bind(this)
    this.toggleUseModal = this.toggleUseModal.bind(this)
    this.merchantIsHere = this.merchantIsHere.bind(this)
    this.applyStep = this.applyStep.bind(this)

    this.dataStore.rememberMe('GameBar', this)
  }

  getItemPrice(name) {
    const regPrice = this.itemPrices[name]
    return Math.floor((1 - this.priceReduction) * regPrice)
  }

  merchantIsHere(b) {
    this.setState({ merchantSpecialCase: b })
  }

  applyStep() {
    if (this.dataStore.isNewConcept('applyStep')) {
      this.dataStore.conceptDone('applyStep')
      this.dataStore.tell('App').newConceptModal('applyStep')
    }
    this.setState((prevState) => {
      const tempState = prevState
      if (tempState.stamina <= 0) {
        tempState.health -= 1
        if (tempState.health <= 0) tempState.health = 0
      }
      if (tempState.intelligence <= 0) {
        tempState.health -= 1
        if (tempState.health <= 0) tempState.health = 0
      }
      if (tempState.sanity <= 0) {
        tempState.intelligence -= 1
        if (tempState.intelligence <= 0) tempState.intelligence = 0
      }

      tempState.stamina -= 1
      if (tempState.stamina <= 0) tempState.stamina = 0

      this.dataStore.setStamina(tempState.stamina)
      this.dataStore.setHealth(tempState.health)
      this.dataStore.setIntelligence(tempState.intelligence)
      this.dataStore.setSanity(tempState.sanity)
      return tempState
    }, () => {
      const { health } = this.state
      if (health <= 0) {
        this.dataStore.gameOver()
      }
    })
  }

  buyItem(name, price) {
    // is used in 3 cases:
    // user buys item from a merchant for a set price
    // user kills merchant, gets all of his items for price=0
    // user finds an item through an effect so price=0
    const goldIndex = this.findInventoryItemByName('GOLD')
    let gold = 0
    const { inventory } = this.state
    if ((typeof goldIndex === 'number' && (inventory.length < this.inventoryCells.length))) {
      if (inventory[goldIndex].quantity >= price) {
        // only proceed if user has enough gold
        this.setState((prevState) => {
          const tempState = prevState

          tempState.inventory[goldIndex].quantity -= price
          gold = tempState.inventory[goldIndex].quantity
          if (tempState.inventory[goldIndex].quantity <= 0) {
            tempState.inventory.splice(goldIndex, 1)
          }

          let item = this.findInventoryItemByName(name)
          if (typeof item !== 'number') {
            item = this.findItemByName(name)
            item.quantity = 1
            tempState.inventory.push(item)
          } else {
            tempState.inventory[item].quantity += 1
          }

          this.dataStore.setInventory(tempState.inventory)

          return tempState
        }, () => {
          if (this.dataStore.merchantIsActive()) {
            this.dataStore.tell('Merchant').goldChanged(gold)
          }
        })
      }
    } else if (price === 0 && inventory.length < this.inventoryCells.length) {
      // if the user does not have any gold, they should still be able to 'buy'
      // an item if the price is 0
      this.setState((prevState) => {
        const tempState = prevState

        let item = this.findInventoryItemByName(name)
        if (typeof item !== 'number') {
          item = this.findItemByName(name)
          item.quantity = 1
          tempState.inventory.push(item)
        } else {
          tempState.inventory[item].quantity += 1
        }

        this.dataStore.setInventory(tempState.inventory)

        return tempState
      }, () => {
        if (this.dataStore.merchantIsActive()) {
          this.dataStore.tell('Merchant').goldChanged(gold)
        }
      })
    }
  }

  changeStat(statName, amount, callback) {
    // used to change any of the stats: health, int, stamina, sanity
    if (statName === 'gold') {
      // special case
      let gold = this.findInventoryItemByName('GOLD') // returns index of gold
      if (typeof gold !== 'number') {
        // the user does not have any gold...
        gold = this.findItemByName('GOLD')
        gold.quantity = amount
        this.setState((prevState) => {
          prevState.inventory.push(gold)
          this.dataStore.setInventory(prevState.inventory)
          return prevState
        }, () => {
          callback()
        })
      } else {
        this.setState((prevState) => {
          const tempState = prevState
          tempState.inventory[gold].quantity += amount
          this.dataStore.setInventory(tempState.inventory)
          return tempState
        }, () => {
          callback()
        })
      }
    } else {
      this.setState((prevState) => {
        const oldAmount = prevState[statName]
        let newAmount = oldAmount + amount
        if (newAmount > 100) newAmount = 100 // instead of 100, use dynamicVars here...
        if (newAmount < 0) newAmount = 0
        if (statName === 'health' && newAmount === 0) {
          this.dataStore.gameOver()
        }
        const setStat = `set${statName.charAt(0).toUpperCase()}${statName.slice(1)}`
        this.dataStore[setStat](newAmount)
        return { [statName]: newAmount }
      }, () => {
        callback()
      })
    }
  }

  toggleModal(e) {
    // misleading name, only toggles the INVENTORY modal
    e.preventDefault()
    const action = e.target.name
    if (action === 'open') {
      this.setState({ modalOpen: true })
    } else {
      this.setState({ modalOpen: false })
    }
  }

  findInventoryItemByName(name) {
    // returns an index of an inventory item
    const { inventory } = this.state
    if (!inventory) return null

    let itemIndex = null
    inventory.forEach((item, ind) => {
      if (item.name === name) {
        itemIndex = ind
      }
    })
    return itemIndex
  }

  findItemByName(name) {
    // only used to find the item template, not
    // the actual item from your inventory.
    // use findInventoryItemByName for that instead
    const list = this.inventoryItems
    let item = {}
    let done = false
    list.forEach((thing) => {
      if (!done) {
        if (thing.name === name) {
          item = thing
          done = true
          return null
        }
      }
      return null
    })
    return item
  }

  updateFunction(obj) {
    if (obj.type === 'name') {
      this.dataStore.setName(obj.val)
      this.setState({ name: obj.val })
    } else if (obj.type === 'health') {
      this.dataStore.setHealth(obj.val)
      this.setState({ health: obj.val })
    } else if (obj.type === 'int') {
      this.dataStore.setIntelligence(obj.val)
      this.setState({ intelligence: obj.val })
    } else if (obj.type === 'san') {
      this.dataStore.setSanity(obj.val)
      this.setState({ sanity: obj.val })
    } else if (obj.type === 'stm') {
      this.dataStore.setStamina(obj.val)
      this.setState({ stamina: obj.val })
    } else if (obj.type === 'inventory') {
      this.setState(() => {
        const item = this.findItemByName(obj.val)
        item.quantity = 1
        // const gasoline = { name: 'GASOLINE', src: 'GASOLINE_ICON.jpg', quantity: 1 }
        // const lighter = { name: 'LIGHTER', src: 'LIGHTER_ICON.jpg', quantity: 1 }
        // const knife = { name: 'KNIFE', src: 'KNIFE_ICON.jpg', quantity: 1 }
        // const water = { name: 'WATER', src: 'WATER_ICON.jpg', quantity: 1 }
        // const book = { name: 'BOOK', src: 'BOOK_ICON.jpg', quantity: 1 }
        // const food = { name: 'FOOD', src: 'FOOD_ICON.jpg', quantity: 1 }
        // const trebuchet = { name: 'TREBUCHET', src: 'TREBUCHET_ICON.jpg', quantity: 1 }
        // const slingshot = { name: 'SLINGSHOT', src: 'SLINGSHOT_ICON.jpg', quantity: 1 }
        this.dataStore.setInventory([item])
        return { inventory: [item] }
        // // default
        // this.dataStore.setInventory([item])
        // return { inventory: [item] }
      })
    }
  }

  fillInventoryCell(ind) {
    // called N times in a row, where N is the max number of inventory items
    // for each call, simply return an inventory item with the right name, image, text, etc.
    const { merchantSpecialCase } = this.state
    let merchant = false
    let prevStage
    let obj
    if (merchantSpecialCase) {
      merchant = true
    } else {
      prevStage = this.dataStore.getPreviousStageAtId(this.dataStore.getStage())
      obj = this.dataStore.getPathObj(prevStage)

      if (Array.isArray(obj)) {
        obj = obj[this.dataStore.getNotFinalIndex()][this.dataStore.getPreviousDirectionAtId(prevStage)]
      } else if (obj) {
        obj = obj[this.dataStore.getPreviousDirectionAtId(prevStage)]
      }
      if (obj) {
        merchant = (obj.effect === 'MERCHANT' && this.dataStore.merchantIsAlive())
      }
    }

    const { inventory } = this.state
    const item = inventory[ind]
    if (item) {
      let price = null
      if (merchant && item.name !== 'GOLD') {
        price = this.getItemPrice(item.name)
      }
      return (
        <div>
          <Image size="medium" label={{ content: item.quantity, ribbon: true }} src={item.src} quantity={item.quantity} />
          <Label name={item.name} as="a" onClick={this.dropItem}>
            Drop
          </Label>
          <Label name={item.name} as="a" onClick={this.useItem}>
            Use
          </Label>
          {merchant && item.name !== 'GOLD' && <Label name={item.name} as="a" onClick={this.sellItem}> Sell for {price} </Label>}
        </div>
      )
    }
    // if the user does not have an item at that index
    // then render an empty square
    return (
      <div>
        <Image size="medium" src="emptyitem.jpg" />
        <Label as="a" style={{ visibility: 'hidden' }}>
          Drop
        </Label>
      </div>
    )
  }

  dropItem(e) {
    e.preventDefault()
    const { name } = e.target
    const itemIndex = this.findInventoryItemByName(name)
    let quant = 0
    if (typeof itemIndex === 'number') {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.inventory[itemIndex].quantity -= 1
        quant = tempState.inventory[itemIndex].quantity
        if (tempState.inventory[itemIndex].quantity <= 0) {
          tempState.inventory.splice(itemIndex, 1)
        }

        this.dataStore.setInventory(tempState.inventory)
        return tempState
      }, () => {
        if (name === 'GOLD') {
          this.dataStore.tell('Merchant').goldChanged(quant)
        }
      })
    }
  }

  useItem(e) {
    e.preventDefault()
    const { name } = e.target
    const func = gameBarVars.useItemEffects(name)

    this.setState((prevState) => {
      const { newState, isItemDropped } = func(prevState, this.dataStore, this)
      if (isItemDropped) {
        const event = {
          preventDefault: () => null,
          target: {
            name,
          },
        }
        this.dropItem(event)
      }
      return newState
    }, () => {
      this.setState({ useItemModal: true })
    })
  }

  toggleUseModal(e) {
    // triggers a modal when user clicks 'close' on a use item modal
    // actually, before this gets toggled the effect from using that item
    // already is triggered. so here we must check if the user died from
    // that item, in which case: end the game.
    e.preventDefault()
    const { health } = this.state
    if (health <= 0) {
      this.dataStore.gameOver()
    }
    this.setState({ useItemModal: false, useItemMessage: '' })
  }

  sellItem(e) {
    e.preventDefault()
    const itemIndex = this.findInventoryItemByName(e.target.name)
    let price = this.getItemPrice(e.target.name)
    const goldIndex = this.findInventoryItemByName('GOLD')
    const merchantItems = this.dataStore.getMerchantItems()
    if (typeof itemIndex === 'number') {
      this.setState((prevState) => {
        const tempState = prevState
        let newPrice = price

        if (typeof goldIndex === 'number') {
          tempState.inventory[goldIndex].quantity += price
          newPrice = tempState.inventory[goldIndex].quantity
        } else {
          const gold = this.findItemByName('GOLD')
          gold.quantity = price
          newPrice = gold.quantity
          tempState.inventory.push(gold)
        }

        const addedItem = {
          name: tempState.inventory[itemIndex].name,
          src: tempState.inventory[itemIndex].src,
          price: this.itemPrices[tempState.inventory[itemIndex].name],
        }
        this.dataStore.setMerchantItems([...merchantItems, addedItem])
        this.dataStore.tell('Merchant').itemWasSold()

        tempState.inventory[itemIndex].quantity -= 1
        if (tempState.inventory[itemIndex].quantity <= 0) {
          tempState.inventory.splice(itemIndex, 1)
        }

        price = newPrice // so that callback can have a reference to it
        this.dataStore.setInventory(tempState.inventory)
        return tempState
      }, () => {
        this.dataStore.tell('Merchant').goldChanged(price)
      })
    }
  }


  render() {
    const {
      name,
      health,
      intelligence,
      sanity,
      stamina,
      inventory,
      modalOpen,
      useItemModal,
      useItemMessage,
    } = this.state

    const tooSmall = (window.innerWidth < 350)

    return (
      <div>
        <Grid padded style={{ marginTop: '0', marginBottom: '0', backgroundColor: '#1b1c1d' }} doubling columns={6}>
          {name !== '' && (
            <Grid.Column style={this.columnStyle} stretched color="black">
              <Header style={this.headerStyle} inverted color="black" as="h5">
                NAME: {name}
              </Header>
            </Grid.Column>
          )}
          {health !== -1 && (
            <Grid.Column style={this.columnStyle} stretched color="black">
              <Header style={this.headerStyle} inverted color="black" as="h5">
                HEALTH: {health}
              </Header>
            </Grid.Column>
          )}
          {intelligence !== -1 && (
            <Grid.Column style={this.columnStyle} stretched color="black">
              <Header style={this.headerStyle} inverted color="black" as="h5">
                INT: {intelligence}
              </Header>
            </Grid.Column>
          )}
          {sanity !== -1 && (
            <Grid.Column style={this.columnStyle} color="black">
              <Header style={this.headerStyle} inverted color="black" as="h5">
                SAN: {sanity}
              </Header>
            </Grid.Column>
          )}
          {stamina !== -1 && (
            <Grid.Column style={this.columnStyle} color="black">
              <Header style={this.headerStyle} inverted color="black" as="h5">
                STM: {stamina}
              </Header>
            </Grid.Column>
          )}
          {inventory !== -1 && (
            <Grid.Column style={this.columnStyle} color="black">
              <Header inverted color="black" as="h5">
                <Modal onClose={this.toggleModal} closeOnDimmerClick={false} closeOnDocumentClick={false} open={modalOpen} trigger={<Button name="open" onClick={this.toggleModal} size="mini" inverted compact>INVENTORY</Button>}>
                  <Modal.Header>
                    <Grid style={{ marginTop: '0', marginBottom: '0' }} columns={2}>
                      <Header style={tooSmall ? { margin: '0', paddingRight: '0rem' } : { margin: '0' }} icon="box" content="Inventory" />
                      <Button name="close" onClick={this.toggleModal} size="small" color="red" compact> Close </Button>
                    </Grid>
                  </Modal.Header>
                  <Modal.Content>
                    <Grid columns={4} doubling>
                      {this.inventoryCells.map(ind => (
                        <Grid.Column>
                          {this.fillInventoryCell(ind)}
                        </Grid.Column>
                      ))}
                    </Grid>
                  </Modal.Content>
                </Modal>
              </Header>
            </Grid.Column>
          )}
          {useItemModal && (
            <Modal style={{ marginTop: 'auto', marginBottom: 'auto' }} onClose={this.toggleUseModal} centered closeOnDimmerClick={false} closeOnDocumentClick={false} open>
              <Modal.Header>
                <Button name="close" onClick={this.toggleUseModal} size="small" color="red" compact> Close </Button>
              </Modal.Header>
              <Modal.Content>
                {useItemMessage}
              </Modal.Content>
            </Modal>
          )}
        </Grid>
      </div>
    )
  }
}

GameBar.propTypes = {
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
