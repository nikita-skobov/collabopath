import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Header,
  Grid,
  Button,
} from 'semantic-ui-react'

// import ImageOverlay from './ImageOverlay'
import nlsplit from '../nlsplit'

class Support extends Component {
  constructor(props) {
    super(props)
    this.body = props.body
    this.patreon = props.patreon
  }

  render() {
    return (
      <Grid verticalAlign="middle" centered columns={1}>
        <Grid.Row>
          <Header className="p4vh em3h" as="h1" textAlign="center">
            I want this website to be free
          </Header>
        </Grid.Row>
        <Grid.Row>
          <Header className="ps15vw" as="h3" textAlign="center">
            {nlsplit(this.body)}
          </Header>
        </Grid.Row>
        <Grid.Row>
          <a target="_blank" rel="noopener noreferrer" href={this.patreon}>
            <Button style={{ backgroundColor: '#f96854', color: 'white' }}>Patreon</Button>
          </a>
        </Grid.Row>
        <Grid.Row />
      </Grid>
    )
  }
}

Support.propTypes = {
  body: PropTypes.string.isRequired,
  patreon: PropTypes.string.isRequired,
}

export default Support
