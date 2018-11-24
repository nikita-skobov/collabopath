import React from 'react'
import PropTypes from 'prop-types'
import { Button, Loader, Grid } from 'semantic-ui-react'
import MakePath from './MakePath'

const PathChoices = (props) => {
  // console.log('CONSTRUCTING PATHCHOICES')
  const { obj, callback, display, exists, notFinalized, dataStore, id, badError } = props
  // console.log(`ID: ${id}`)

  if (badError) {
    return (
      <div className="ps3em mt2em">
        <Button color="red" disabled className="mb2vh">Unexpected Error! Please try again by refreshing this path</Button>
        <div style={{ height: '260px' }} />
      </div>
    )
  }

  if (obj === null || !display) {
    return (
      <div className="ps3em mt2em">
        <Loader active inline> Loading Next Path </Loader>
        <div style={{ height: '260px' }} />
      </div>
    )
  }
  if (notFinalized && exists) {
    return (
      <div className="ps3em mt2em">
        <Grid.Row>
          <MakePath useCurrentId id={id} btnMessage="The path choices below are not finalized yet. You can add your own!" dataStore={dataStore} />
        </Grid.Row>
        <Grid.Row>
          <Button color="blue" className="mb2vh" name="0" onClick={callback}>{obj.choiceL.q}</Button>
          <Button color="blue" name="1" onClick={callback}>{obj.choiceR.q}</Button>
        </Grid.Row>
        <div style={{ height: '260px' }} />
      </div>
    )
  }
  if (exists) {
    return (
      <div className="ps3em mt2em">
        <Button color="blue" className="mb2vh" name="0" onClick={callback}>{obj.choiceL.q}</Button>
        <Button color="blue" name="1" onClick={callback}>{obj.choiceR.q}</Button>
        <div style={{ height: '260px' }} />
      </div>
    )
  }
  if (notFinalized) {
    return (
      <div className="ps3em mt2em">
        <MakePath id={id} btnMessage="This path is not finalized yet. You can add your own!" dataStore={dataStore} />
        <div style={{ height: '260px' }} />
      </div>
    )
  }
  return (
    <div className="ps3em mt2em">
      <MakePath useCurrentId id={id} btnMessage="You have reached the end of this path. You can make your own!" dataStore={dataStore} />
      <div style={{ height: '260px' }} />
    </div>
  )
}

export default PathChoices


PathChoices.propTypes = {
  obj: PropTypes.instanceOf(Object).isRequired,
  callback: PropTypes.func.isRequired,
  display: PropTypes.bool.isRequired,
  exists: PropTypes.bool.isRequired,
  notFinalized: PropTypes.bool.isRequired,
  dataStore: PropTypes.instanceOf(Object).isRequired,
  id: PropTypes.string.isRequired,
  badError: PropTypes.bool.isRequired,
}
