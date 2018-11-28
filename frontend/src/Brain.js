import {
  pathObjects as pathObjs,
  encodePath as encodeP,
  getPathObjEndpoint,
  votePathObjEndpoint,
  addPathObjEndpoint,
  minimumRefreshDelay,
  StatAllocate,
  PathViewer,
  startingStage,
  DEV,
} from './dynamicVars'

function Brain() {
  let gameRunning = false
  let stage = startingStage
  const gameData = {
    name: '',
    health: -1,
    intelligence: -1,
    sanity: -1,
    stamina: -1,
    inventory: -1,
  }

  const components = {} // object to keep track of different components
  // each component is stored where the key is the component name, and the value
  // is a reference to that component

  const concepts = [] // an array of concept keywors
  // if a concept event happens, if it is not in this array, then the concept modal
  // pops up for that event. only happens once.

  const pathObjects = pathObjs
  let pathDirection = null
  let previousDirection = null
  let previousStage = null
  let notFinalIndex = null // this is an index of the path Obj array for the
  // last path object (when it isnt finalized yet, pathObj is an array instead
  // of an object, so you must keep track of WHICH object was chosen)
  const encodePath = encodeP
  let pathArray = []
  let pathObjects2 = {}
  const pathObjectSubmissions = {}
  let effectDoneArray = []
  let conditionCalculated = {}
  let merchantItems = null
  let merchantIsAlive = true
  let merchantCoveredInGasoline = false
  let isCoveredInGasoline = false
  let lastRefresh = null
  let voteList = []
  let activeConcept = null
  let userHasDied = false
  let dontShowConcepts = false
  let allocatePointsRemaining = StatAllocate.totalPoints
  let allocatedPoints = {
    health: 0,
    intelligence: 0,
    stamina: 0,
    sanity: 0,
  }

  const getEndpoint = getPathObjEndpoint // the lambda endpoint
  const voteEndpoint = votePathObjEndpoint
  const addEndpoint = addPathObjEndpoint

  const has = Object.prototype.hasOwnProperty

  return {
    resetGame: () => {
      gameData.name = ''
      gameData.health = -1
      gameData.intelligence = -1
      gameData.sanity = -1
      gameData.stamina = -1
      gameData.inventory = -1
      stage = 0
      gameRunning = false
      pathDirection = null
      previousDirection = null
      previousStage = null
      notFinalIndex = null
      allocatePointsRemaining = StatAllocate.totalPoints
      allocatedPoints = {
        health: 0,
        intelligence: 0,
        stamina: 0,
        sanity: 0,
      }
      activeConcept = null
      pathArray = []
      pathObjects2 = {}
      effectDoneArray = []
      conditionCalculated = {}
      userHasDied = false
      merchantItems = null
      merchantIsAlive = true
      merchantCoveredInGasoline = false
      isCoveredInGasoline = false
      components.App.resetGame()
    },
    rememberMe: (name, reference) => {
      components[name] = reference
    },
    tell: name => components[name],

    gameOver: () => {
      if (!DEV) {
        if (!userHasDied) {
          // if the user has not died yet, then display this concept
          // and then set it to true, so this doesnt show up again the next time they died.
          components.App.newConceptModal('gameover')
          userHasDied = true
        }
      }
    },
    canRefresh: () => {
      if (!lastRefresh) {
        lastRefresh = new Date()
        return true
      }
      const rightNow = new Date()
      if (rightNow.getTime() - lastRefresh.getTime() > minimumRefreshDelay) {
        lastRefresh = rightNow
        return true
      }
      return false
    },

    gameStarted: () => gameRunning,
    startGame: () => {
      gameRunning = true
    },
    dangerouslySetStage: (s) => {
      stage = s
    },
    setStage: (s) => {
      let changedS = s
      if (typeof s === 'number') {
        // prevents stages 1-5 from getting into pathObjects2
        // this affects getPreviousStageAtId(...) when trying
        // to access id '1' and it tries to get 1 as a number
        // instead of 1 as a string
        changedS = `.${s}`
      }

      if (!has.call(pathObjects2, changedS)) {
        pathObjects2[changedS] = {
          previousStage: stage,
          direction: null,
        }
      }
      previousStage = stage
      stage = changedS
    },
    getStage: () => {
      return stage
    },
    getPreviousStageAtId: (id) => {
      if (has.call(pathObjects2, id)) {
        return pathObjects2[id].previousStage
      }
      return null
    },
    getPreviousDirectionAtId: (id) => {
      if (has.call(pathObjects2, id)) {
        return pathObjects2[id].direction
      }
      return null
    },
    // getPreviousStage: () => previousStage,
    // getDirection: () => pathDirection,
    // getPreviousDirection: () => previousDirection,
    setDirection: (dir, id) => {
      // previousDirection = pathDirection
      if (dir === '0') pathDirection = 'choiceL'
      if (dir === '1') pathDirection = 'choiceR'
      if (has.call(pathObjects2, id)) {
        pathObjects2[id].direction = pathDirection
      }
    },
    getNotFinalIndex: () => notFinalIndex,
    setNotFinalIndex: (i) => {
      notFinalIndex = i
    },

    getPoints: () => allocatePointsRemaining,
    spendPoints: (stat, dir) => {
      if (dir === 'u') {
        if (allocatePointsRemaining > 0) {
          if (allocatedPoints[stat] < PathViewer[`${stat}Max`]) {
            allocatedPoints[stat] += 5
            allocatePointsRemaining -= 5
            return true
          }
          // dont allow going over the maximum
          return false
        }
        // dont allocate if no points remain
        return false
      }
      // otherwise dir === 'd'
      if (allocatePointsRemaining < StatAllocate.totalPoints) {
        if (allocatedPoints[stat] > 0) {
          allocatedPoints[stat] -= 5
          allocatePointsRemaining += 5
          return true
        }
        // dont allow going below 0
        return false
      }
      return false
    },
    getPointsAt: (stat) => {
      return allocatedPoints[stat]
    },

    effectDone: (i, v) => {
      effectDoneArray.push(`${i}${v}`)
    },
    isEffectDone: (i, v) => effectDoneArray.includes(`${i}${v}`),
    getMerchantItems: () => merchantItems,
    setMerchantItems: (i) => {
      merchantItems = i
    },
    killMerchant: () => {
      merchantIsAlive = false
      components.PathEffect.merchantWasKilled()
    },
    merchantIsAlive: () => merchantIsAlive,
    merchantIsActive: () => {
      if (Array.isArray(merchantItems)) {
        return true
      }
      return false
    },

    isMerchantCoveredInGasoline: () => merchantCoveredInGasoline,
    setMerchantInGasoline: (b) => { merchantCoveredInGasoline = b },

    buyItem: (name, price) => {
      if (merchantItems) {
        let removedIndex = -1
        merchantItems.forEach((item, index) => {
          if (item.name === name) {
            removedIndex = index
          }
        })
        merchantItems.splice(removedIndex, 1)
      }
      components.GameBar.buyItem(name, price)
    },

    getName: () => gameData.name,
    getHealth: () => gameData.health,
    getIntelligence: () => gameData.intelligence,
    getSanity: () => gameData.sanity,
    getStamina: () => gameData.stamina,
    getInventory: () => gameData.inventory,
    setName: (n) => { gameData.name = n },
    setHealth: (h) => { gameData.health = h },
    setIntelligence: (i) => { gameData.intelligence = i },
    setSanity: (s) => { gameData.sanity = s },
    setStamina: (c) => { gameData.stamina = c },
    setInventory: (i) => { gameData.inventory = i },
    setCoveredInGasoline: (b) => { isCoveredInGasoline = b },
    isCoveredInGasoline: () => isCoveredInGasoline,

    isNewConcept: (name) => {
      // is user specified that they dont want to see
      // concept modals, then always return false
      if (dontShowConcepts) return false
      return !concepts.includes(name)
    },
    conceptDone: name => concepts.push(name),
    isConceptActive: name => activeConcept === name,
    setActiveConcept: (name) => { activeConcept = name },
    dontShowConcepts: () => { dontShowConcepts = true },

    setConditionalCalculatedAt: (id, pass) => {
      conditionCalculated[id] = pass
    },
    isConditionCalculated: (id) => {
      return has.call(conditionCalculated, id)
    },
    getConditionCalculation: (id) => {
      return conditionCalculated[id]
    },

    getPathObj: (key) => {
      if (has.call(pathObjects, key)) {
        return pathObjects[key]
      }
      return null
    },
    appendPath: (dir) => {
      let last = pathArray[pathArray.length - 1]
      if (last >= 0) {
        if (last.length === 4) {
          pathArray.push(dir)
        } else {
          last += dir
          pathArray[pathArray.length - 1] = last
        }
      } else {
        pathArray.push(dir)
      }
    },
    popPath: () => {
      let last = pathArray[pathArray.length - 1]
      last = last.slice(0, -1)
      if (last.length === 0) {
        pathArray.pop()
      } else {
        pathArray[pathArray.length - 1] = last
      }
    },
    getEncodedPath: () => {
      const str = encodePath(pathArray)
      return str
    },
    fetchObject: (id, callback) => {
      const url = `${getEndpoint}${id}`
      fetch(url)
        .then(resp => resp.json())
        .then((json) => {
          // console.log('got object!')
          // console.log(json)
          if (has.call(json, 'obj')) {
            if (json.pathId !== id) {
              console.log('returned obj is the wrong one!')
            }
            pathObjects[id] = json.obj
            if (!dontShowConcepts) {
              // only show concept if user did not specify
              // that dontShowConcepts should be true

              if (Array.isArray(json.obj)) {
                // if its an array, then its not finalized
                if (!concepts.includes('userObjectNF')) {
                  components.App.newConceptModal('userObjectNF')
                  concepts.push('userObjectNF')
                }
              } else if (!concepts.includes('userObjectBasic')) {
                // if its not an array, then its finalized
                components.App.newConceptModal('userObjectBasic')
                concepts.push('userObjectBasic')
              }
            }
            callback(null, json.obj)
          } else if (has.call(json, 'error') && json.error.includes('not found')) {
            if (!dontShowConcepts) {
              if (!concepts.includes('userObjectNoExist')) {
                components.App.newConceptModal('userObjectNoExist')
                concepts.push('userObjectNoExist')
              }
            }
            pathObjects[id] = { doesNotExist: 'yes' }
            callback('OBJNOEXIST', pathObjects[id])
          } else {
            console.warn('Encountered Unknown error:')
            console.warn(json)
            callback('UNKNOWNERROR', json)
          }
        })
        .catch((err) => {
          console.warn('Encountered Network error:')
          console.warn(err)
          callback('FETCHERROR', null)
        })
    },
    addPathObj: (id, pathObj, callback) => {
      fetch(addEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ obj: pathObj, pathId: id }),
      }).then((resp) => {
        // console.log(resp)
        return resp.json()
      }).then((json) => {
        // console.log(json)
        if (!has.call(json, 'error')) {
          // success. add an entry to pathObjectSubmissions
          // to prevent user from being able to upload
          // another pathObject at the same id
          pathObjectSubmissions[id] = {}
          callback(null)
        } else {
          if (json.error.includes('reason: 6')) {
            pathObjectSubmissions[id] = {}
          }
          callback(json.error)
        }
      }).catch((err) => {
        // console.log(err)
        callback(err.message)
      })
    },
    voteFor: (pathID, voteID, callback) => {
      // console.log(`MAKING A VOTE REQUEST: ${pathID}, voteID: ${voteID}`)
      fetch(voteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voteId: voteID,
        }),
      }).then((resp) => {
        // console.log(resp)
        return resp.json()
      }).then((json) => {
        // console.log(json)
        if (!has.call(json, 'error')) {
          voteList.push(voteID)
          callback(null)
        } else {
          callback(json.error)
        }
      }).catch((err) => {
        // console.log(err)
        callback(err.message)
      })
    },
    isVoteDone: (voteID) => {
      return voteList.includes(voteID)
    },
    allowedToUpload: (id) => {
      // returns true if the user has NOT submitted a pathObject
      // with the given id
      return (!has.call(pathObjectSubmissions, id))
    },
  }
}

export default Brain
