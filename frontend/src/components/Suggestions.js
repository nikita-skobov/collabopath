import React, { Component } from 'react'

import { Grid, Header, Button, TextArea } from 'semantic-ui-react'

import { maxSuggestionLength, suggestionEndpoint } from '../dynamicVars'

const style1 = { width: '92%' }
const style3 = { display: 'inline-block', verticalAlign: 'middle', backgroundColor: '#2185d0', minHeight: '0', paddingTop: '0.3rem', paddingBottom: '0.3rem', color: 'white' }

export default class Suggestions extends Component {
  constructor(props) {
    super(props)

    this.state = {
      text: '',
      success: 0,
    }

    this.handleText = this.handleText.bind(this)
    this.submit = this.submit.bind(this)
    this.handleResponse = this.handleResponse.bind(this)
  }

  handleResponse(err) {
    if (err) {
      this.setState({ success: -1 })
    } else {
      this.setState({ success: 1 })
    }
  }

  submit(e) {
    e.preventDefault()
    const { text } = this.state
    fetch(suggestionEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
      }),
    }).then(resp => resp.json())
      .then((obj) => {
        const has = Object.prototype.hasOwnProperty
        if (!has.call(obj, 'error')) {
          // there is no error so success message
          this.handleResponse(null)
        } else {
          this.handleResponse(1)
        }
      })
      .catch((err) => {
        this.handleResponse(err)
      })
  }

  handleText(e, obj) {
    this.setState({ text: obj.value })
  }

  render() {
    const { success } = this.state
    if (success === 0) {
      // hasnt happened yet
      return (
        <Grid.Row centered columns={1}>
          <Header textAlign="center" className="ps15vw" as="h4"> This site is still in beta, so I would really appreciate any criticisms, suggestions, or other improvements that you think would make this site better.</Header>
          <TextArea maxLength={maxSuggestionLength} rows={8} style={{ width: '80%' }} onChange={this.handleText} autoHeight placeholder={`Enter your suggestions here. Limit ${maxSuggestionLength} characters`} />
          <Grid.Row centered>
            <Button color="green" name="submit" onClick={this.submit}>Submit</Button>
          </Grid.Row>
        </Grid.Row>
      )
    }
    if (success === 1) {
      // successful response
      return (
        <Grid.Row centered columns={1}>
          <Header textAlign="center" className="ps15vw" as="h4"> Thank you for your feedback!</Header>
        </Grid.Row>
      )
    }
    // some kind of error
    return (
      <Grid.Row centered columns={1}>
        <Header textAlign="center" className="ps15vw" as="h4" color="red"> Oops! We were not able to process your suggestion. Please try again.</Header>
        <TextArea maxLength={maxSuggestionLength} rows={8} style={{ width: '80%' }} onChange={this.handleText} autoHeight placeholder={`Enter your suggestions here. Limit ${maxSuggestionLength} characters`} />
        <Grid.Row centered>
          <Button color="green" name="submit" onClick={this.submit}>Submit</Button>
        </Grid.Row>
      </Grid.Row>
    )
  }
}
