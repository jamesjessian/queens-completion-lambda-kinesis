const AWS = require('aws-sdk')
const config = require('./config')

const kinesis = new AWS.Kinesis({region:"eu-west-2"})

const params = {
    Data: '{"key":"0", "connections":"0" , "level": 0}' /* Strings will be Base-64 encoded on your behalf */, /* required */
    PartitionKey: '0', /* required */
    StreamName: config.KINESIS_WORK_STREAM, /* required */
}

kinesis.putRecord(params, (err, data) => {
  if (err) console.log(err, err.stack) // an error occurred
  else     console.log(data)           // successful response
})