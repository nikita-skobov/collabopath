import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Grid, Button, Header, Icon } from 'semantic-ui-react'

export default class StatAllocate extends Component {
  constructor(props) {
    // console.log('CONSTRUCTING SLOT')
    super(props)

    this.callback = props.callback
    this.dataStore = props.dataStore

    this.state = {
      pointsRemaining: this.dataStore.getPoints(),
      health: this.dataStore.getPointsAt('health'),
      intelligence: this.dataStore.getPointsAt('intelligence'),
      stamina: this.dataStore.getPointsAt('stamina'),
      sanity: this.dataStore.getPointsAt('sanity'),
    }

    this.submit = this.submit.bind(this)
    this.changeStat = this.changeStat.bind(this)
  }

  submit(e) {
    e.preventDefault()
    const { health, intelligence, stamina, sanity } = this.state
    this.callback(null, { health, intelligence, stamina, sanity })
  }

  changeStat(e) {
    e.preventDefault()
    const stat = e.target.getAttribute('stat')
    const dir = e.target.getAttribute('dir')
    const changed = this.dataStore.spendPoints(stat, dir)
    if (changed) {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.health = this.dataStore.getPointsAt('health')
        tempState.intelligence = this.dataStore.getPointsAt('intelligence')
        tempState.stamina = this.dataStore.getPointsAt('stamina')
        tempState.sanity = this.dataStore.getPointsAt('sanity')
        tempState.pointsRemaining = this.dataStore.getPoints()
        return tempState
      })
    }
  }

  render() {
    const { pointsRemaining } = this.state
    const stats = ['health', 'intelligence', 'stamina', 'sanity']
    return (
      <Grid className="ps5vw">
        <Grid.Row centered>You have {pointsRemaining} points</Grid.Row>
        {stats.map(stat => (
          <Grid.Row centered columns={2}>
            <Grid.Column className="fs08em">
              {stat}
              <Icon name="question circle" />
            </Grid.Column>
            <Grid.Column>
              <Grid centered columns="equal">
                <Grid.Column width={1}>
                  <Icon onClick={this.changeStat} className="pr13em hvc" name="angle down" stat={stat} dir="d" />
                </Grid.Column>
                <Grid.Column width={7}>
                  <Header as="h5" textAlign="center">
                    {this.state[stat]}
                  </Header>
                </Grid.Column>
                <Grid.Column width={1}>
                  <Icon onClick={this.changeStat} className="pr13em hvc" name="angle up" stat={stat} dir="u" />
                </Grid.Column>
              </Grid>
            </Grid.Column>
          </Grid.Row>
        ))}
        <Grid.Row centered>
          <Button color="blue" onClick={this.submit}>Submit</Button>
        </Grid.Row>
        <Grid.Row />
        <Grid.Row />
      </Grid>
    )
  }
}

StatAllocate.propTypes = {
  callback: PropTypes.func.isRequired,
  dataStore: PropTypes.instanceOf(Object).isRequired,
}
