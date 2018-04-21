const BN = require('bn.js')
const processSet = require('./process')

let queue = []
let resultCount = 0

const initialRecord = {key: new BN(0)}

const onNewSet = (set) => {
    queue.push(set)
}

const onResult = (result) => {
    console.log(resultCount++, ':', result)
}

queue.push(initialRecord)

console.log('Processing queue...')

while(queue.length > 0) {
    const set = queue.pop()
    processSet(set, onNewSet, onResult)
    // console.log(queue.length)
}