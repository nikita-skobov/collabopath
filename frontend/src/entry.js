/* global document fetch */
import React from 'react'
import ReactDOM from 'react-dom'
import 'promise-polyfill/src/polyfill'
import { BrowserRouter, Switch, Route } from 'react-router-dom'


import {
  About as aboutVars,
  startingStage,
  DEV,
  decodePath,
  Support as supportVars,
} from './dynamicVars'
import Brain from './Brain'
import App from './App'
import Navbar from './components/Navbar'
import About from './components/About'
import ErrorPage from './components/ErrorPage'
import Changelog from './components/Changelog'
import Support from './components/Support'

const reactContainer = document.getElementById('react-container')

const dataStore = Brain()

if (DEV) {
  if (startingStage === '.') {
    dataStore.setStage(5)
    dataStore.setDirection('0', 5)
    dataStore.setStage(startingStage)
  } else if (typeof startingStage !== 'number') {
    dataStore.setStage('.')
    dataStore.setDirection('0', '.')
    const arr = decodePath(startingStage)
    arr.forEach((str) => {
      str.split('').forEach((char) => {
        dataStore.appendPath(char)
      })
    })
    dataStore.setStage(startingStage)
  }
}

const AboutRender = () => (
  <About
    title={aboutVars.title}
    imgUrl={aboutVars.imgUrl}
    text={aboutVars.text}
    socialLinks={aboutVars.socialLinks}
  />
)

const supportRender = () => (
  <Support body={supportVars.body} patreon={supportVars.patreon} />
)

const AppRenderer = () => (
  <App dataStore={dataStore} />
)

ReactDOM.render((
  <BrowserRouter>
    <div>
      <Navbar />
      <Switch>
        <Route path="/" render={AppRenderer} exact />
        <Route path="/support" render={supportRender} />
        <Route path="/about" render={AboutRender} />
        <Route path="/changelog" component={Changelog} />
        <Route component={ErrorPage} />
      </Switch>
    </div>
  </BrowserRouter>
), reactContainer)
