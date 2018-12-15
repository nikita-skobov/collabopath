const functions = require('./functions')
// const has = Object.prototype.hasOwnProperty

// function addDirection(path, direction) {
//   const myPath = path
//   let last = myPath[myPath.length - 1]
//   if (last >= 0) {
//     if (last.length === 4) {
//       myPath.push(direction)
//     } else {
//       last += direction
//       myPath[myPath.length - 1] = last
//     }
//   } else {
//     myPath.push(direction)
//   }
//   return myPath
// }

// function pathExists(items, pathStr) {
//   return has.call(items, pathStr)
// }

// function remapItemList(items) {
//   const myItemsObject = {}

//   items.forEach((item) => {
//     myItemsObject[item.pathId.S] = item.obj.S
//   })

//   return myItemsObject
// }

// function nameToBeDetermined(items, path, direction, count) {
//   const myPath = addDirection(path, direction)
//   const myPathStr = functions.encodePath(myPath)
//   let myCount = count

//   if (has.call(items, myPathStr)) {
//     const tempCount = nameToBeDetermined(items, myPath, direction, myCount)
//     if (tempCount === myCount) {
//       const newDir = direction === '0' ? '1' : '0'
//       const tempCount2 = nameToBeDetermined(items, myPath, newDir, myCount)
//       if (tempCount2 === myCount) {
//         myCount += 1
//       }
//       return myCount
//     }
//     return myCount
//   }
//   return myCount
// }

// function pathExists2(items, path) {
//   const myPathStr = functions.encodePath(path)
//   return has.call(items, myPathStr)
// }

// function traversePaths(items, path) {
//   let myCount = 0
//   let myPath = path
//   let exists = pathExists2(items, path)
//   let dir = '0'
//   while (exists) {
//     myPath = addDirection(myPath, dir)
//     exists = pathExists2(items, myPath)
//   }


// }

// function nameToBeDetermined2(items, path) {
//   let dir = '0'
//   let { myPath, myPathStr } = nameToBeDetermined(items, path, dir)
//   if (has.call(items, myPathStr)) {
//     return nameToBeDetermined2(items, )
//   }
// }

module.exports = function countEndPaths(items) {
  return new Promise((res, rej) => {
    return res(items)
  })
}

// const n = nameToBeDetermined({
//   '0': {},
//   '1': {},
//   '00': {},
//   '01': {},
// }, ['0'], '0', 0)


// console.log(n)
