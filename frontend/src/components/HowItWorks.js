import React from 'react'

import { Grid, Header, Button, Icon, Dropdown } from 'semantic-ui-react'
import { HowItWorks as howItWorksVars } from '../dynamicVars'

const style1 = { width: '92%' }
const style3 = { display: 'inline-block', verticalAlign: 'middle', backgroundColor: '#2185d0', minHeight: '0', paddingTop: '0.3rem', paddingBottom: '0.3rem', color: 'white' }

const HowItWorks = () => (
  howItWorksVars.map((item) => {
    if (typeof item === 'string') {
      return (
        <Grid.Row centered>
          <Header style={style1} as="h2">{item}</Header>
        </Grid.Row>
      )
    }
    if (typeof item === 'object') {
      if (item.type === 'sync') {
        return (
          <Grid.Row centered>
            <Button color="blue" style={{ display: 'inline-block', verticalAlign: 'middle' }} size="mini" compact>
              <Icon style={{ margin: 'auto' }} name="sync alternate" />
            </Button>
          </Grid.Row>
        )
      }
      if (item.type === 'dropdown') {
        return (
          <Grid.Row centered>
            <Dropdown compact style={style3} selection options={[{ key: 'gvrwEfds', text: 'gvrwEfds', value: 'gvrwEfds', content: 'gvrwEfds' }]} value="gvrwEfds" />
          </Grid.Row>
        )
      }
    }
    return null
  })
)

export default HowItWorks
