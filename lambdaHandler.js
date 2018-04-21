
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const config = require('./config')
const processSet = require('./process')
const convert = require('./convertKinesisRecord')

const kinesis = new AWS.Kinesis()
const dynamoDb = new AWS.DynamoDB.DocumentClient()

/**
 * This is our AWS Lambda event handler
 */
function process(event, context, callback) {
	event.Records.forEach(record => {
		const set = convert(record)
		// Pass data and callback functions to processor 
        processSet(set, addNewSet, publishResult)
    })
}

module.exports.process = process

// ========================================================================
// Private functions
// ========================================================================

function publishResult(value) {
	const params = {
		TableName: config.RESULTS_TABLE,
		Item: {
			key: value.toString(16),
			size: config.BOARD_SIZE,
			timestamp: new Date().toString()
		},
	}
	// Write the record to the database
	dynamoDb.put(params, err => {
		if(err) console.error(err, err.stack)
	})
}

function addNewSet(set) { // {key, level, connections (as BNs)}
	const key = set.key.toString(16)
	const params = {
		Data: JSON.stringify({
			level: set.level,
			key: key,
			connections: set.connections.toString(16),
        }),
		PartitionKey: key,
		StreamName: config.KINESIS_WORK_STREAM,
	}
	// Write record to stream
	kinesis.putRecord(params, err => {
		if(err) console.error(err, err.stack)
	})
}