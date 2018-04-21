const BN = require('bn.js')

/**
 * Convert record from our kinesis stream into a set we can process
 * @param {*} record 
 */
function convert(record) {
    // Convert from base64 to Buffer to JSON string
    const jsonStr = Buffer.from(record.kinesis.data, 'base64').toString()
    // ...to an object
    const data = JSON.parse(jsonStr)

    // Check if empty record (i.e. deleted record)
    if(!data) return

    // ...to a set we can process.
    // Each set has a key (a map of nodes), a level (number of nodes in set)
    // and 'connections' (map of mutually connected nodes). Convert from hex
    // string to big number
    const set = {
        level: data.level,
        key: new BN(data.key, 16),
        connections: new BN(data.connections, 16)
    }
    
    return set
}

module.exports = convert