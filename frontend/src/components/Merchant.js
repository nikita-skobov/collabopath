import React, { Component } from 'react'
import { Button, Header, Image, Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'

export default class Merchant extends Component {
  constructor(props) {
    super(props)

    this.dataStore = props.dataStore
    const inventory = this.dataStore.getInventory()
    let gold = 0
    inventory.forEach((item) => {
      if (item.name === 'GOLD') gold = item.quantity
    })

    this.state = {
      items: props.items,
      gold,
    }

    this.buyItem = this.buyItem.bind(this)
    this.goldChanged = this.goldChanged.bind(this)
    this.itemWasSold = this.itemWasSold.bind(this)

    this.dataStore.rememberMe('Merchant', this)
  }

  buyItem(e) {
    e.preventDefault()
    const price = e.target.getAttribute('price')
    this.dataStore.buyItem(e.target.name, price)
    this.setState({ items: this.dataStore.getMerchantItems() })
  }

  goldChanged(val) {
    this.setState({ gold: val })
  }

  itemWasSold() {
    this.setState({ items: this.dataStore.getMerchantItems() })
  }

  render() {
    const { gold, items } = this.state

    // if (this.dataStore.isNewConcept('merchant')) {
    //   // first time a user encounters a merchant,
    //   // pop the modal to give a merchant guide
    //   this.dataStore.setActiveConcept('merchant')
    //   this.dataStore.tell('App').newConceptModal('merchant')
    //   this.dataStore.conceptDone('merchant')
    // }

    return (
      <div>
        <Header as="h3" style={{ marginTop: '0' }}>
          You have {gold} gold. You can open your inventory to sell some items to the merchant.
        </Header>
        <Grid style={{ width: '95vw', margin: 'auto' }} columns={4} centered doubling>
          {items.map((item) => {
            if (item.price > gold) {
              return (
                <Grid.Column>
                  <Button compact disabled style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} name={item.name} price={item.price} onClick={this.buyItem} color="yellow">
                    <Image price={item.price} size="medium" name={item.name} src={item.src} />
                    <div price={item.price} style={{ fontSize: '1.5rem', height: '1.5rem', lineHeight: '1.5rem' }}>{item.price}</div>
                  </Button>
                </Grid.Column>
              )
            }
            return (
              <Grid.Column>
                <Button compact style={{ padding: '0.2em 0.36em 0.2em', margin: 'auto' }} name={item.name} price={item.price} onClick={this.buyItem} color="yellow">
                  <Image price={item.price} size="medium" name={item.name} src={item.src} />
                  <div price={item.price} style={{ fontSize: '1.5rem', height: '1.5rem', lineHeight: '1.5rem' }}>{item.price}</div>
                </Button>
              </Grid.Column>
            )
          })}
        </Grid>
      </div>
    )
  }
}

Merchant.propTypes = {
  items: PropTypes.instanceOf(Array).isRequired,
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
