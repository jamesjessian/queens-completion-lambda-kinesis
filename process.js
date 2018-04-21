const BN = require('bn.js')

const config = require('./config')

const ZERO = new BN(0)
const nodeList = createNodeList(config.BOARD_SIZE)

/**
 * Processes a set of nodes and their mutual connections to produce new
 * set of node with mutual connections.
 * @param {*} set 
 * @param {*} onNewSet 
 * @param {*} onResult 
 */
function process(set, onNewSet, onResult) {
	const {key, connections, level} = set
	
	if(set.key.eq(ZERO)) {
		// ZERO record = add sets which represent each single node
		nodeList.forEach(n => {
			onNewSet({
				level: 1, 
				key: n.key, 
				connections: n.connections,
			})
		})
		return
	}

	for(let n in nodeList) {
		const node = nodeList[n]

		// Drop out if node already in set
		if(key.and(node.key).gt(ZERO)) {
			break
		}

		// Continue if node is in the set's 'connected' list
		if(connections.and(node.key).gt(ZERO)) {
			const newKey = key.or(node.key)
			
			// Find shared connected nodes
			const newConnections = connections.and(node.connections)

			const newSet = {key: newKey, level: level+1, connections: newConnections}
			if(newSet.level === config.BOARD_SIZE) {
				// Create result record
				onResult(key)
			}
			else {
				// Add new set to be processed
				onNewSet(newSet)
			}
		}
	}
}

module.exports = process

// =================================================================================
// Private functions
// =================================================================================

// Returns an array of 'nodes' {key: nodeId, connections: map of connected nodes}
function createNodeList(size) {
	// Create nodes list
	let nodes = []
	for(let x=0; x<size; x++) {
		for(let y=0; y<size; y++) {
			let key = convertPointToValue({x:x,y:y},size)
			let connections = key.clone()
	
			let connectedNodes = getConnectedNodes({x,y}, size, size)
			for(let c in connectedNodes) {
				let connNode = connectedNodes[c]
				connections = connections.or(convertPointToValue(connNode,size))
			}
			nodes.push({key, connections})
		}
	}
	return nodes
}

function getConnectedNodes(point, width, height) {
	let points = []
	for(let x=0; x<width; x++) {
		for(let y=0; y<height; y++) {
			if(x!==point.x && y!==point.y && x+y !== point.x+point.y && x+(height-y) !== point.x+(height-point.y)) {
				points.push({x:x, y:y})
			}
		}
	}
	return points
}

/**
 * This function allows us to number each node. For example, the
 * node a x:0, y:0 is node 0.
 * @param {Object} point Object with x and y values
 * @param {Number} width Width of the board
 */
function getNodeId(point, width) {
	return (new BN(point.y * width)).add(new BN(point.x))
}

function convertPointToValue(point, width) {
	// Value = 2^nodeID
	return (new BN(2)).pow(getNodeId(point, width))
}
