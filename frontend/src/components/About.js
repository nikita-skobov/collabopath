import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Header,
  Grid,
  Container,
  Button,
} from 'semantic-ui-react'

import ImageOverlay from './ImageOverlay'
import nlsplit from '../nlsplit'

class About extends Component {
  constructor(props) {
    super(props)
    this.title = props.title
    this.imgUrl = props.imgUrl
    this.text = props.text
    this.socialLinks = props.socialLinks

    // this.myStyle = {
    //   margin: 'auto',
    //   maxWidth: '800px',
    //   marginTop: '4vh',
    //   marginBottom: '4vh',
    // }
  }

  render() {
    return (
      <div>
        <ImageOverlay src={this.imgUrl} maxWidth="100%" opacity={0.75}>
          <Header as="h1" size="large" textAlign="center" style={{ fontSize: '2.3em', color: 'white' }}>
            {this.title}
          </Header>
        </ImageOverlay>
        <Container fluid>
          <Grid verticalAlign="middle">
            <Grid.Row>
              <Header className="p4vh" as="h3" textAlign="center">
                {nlsplit(this.text)}
              </Header>
            </Grid.Row>
            <Grid.Row centered columns={this.socialLinks.length}>
              {this.socialLinks.map((item) => {
                return <a target="_blank" rel="noopener noreferrer" href={item.link}><Button color="blue">{item.type}</Button></a>
              })}
            </Grid.Row>
            <Grid.Row />
          </Grid>
        </Container>
      </div>
    )
  }
}


About.propTypes = {
  title: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  socialLinks: PropTypes.instanceOf(Array).isRequired,
}

export default About
