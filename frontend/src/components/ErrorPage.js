import React from 'react'

import { Grid, Header } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'

const ErrorPage = () => (
  <Grid centered>
    <Grid.Row />
    <Grid.Row>
      <Header as="h1">404: Page Not Found</Header>
    </Grid.Row>
    <Grid.Row>
      <Header as="h3">Go back to the <NavLink to="/">home page?</NavLink></Header>
    </Grid.Row>
  </Grid>
)

export default ErrorPage
