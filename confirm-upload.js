'use strict';
const AWS = require('aws-sdk');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = (event, context, callback) => {
  
  var now = new Date();           

  function response(error, result) {
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({path: path, filename: filename, result: result, error: error})
    };
    callback(null, response);
  }

   var item = {
        id: event.Records[0].s3.object.key,
        added: now.toISOString()
    };

    var params = {
        TableName: process.env.UPLOADED_FILES_TABLE,
        Item: item
    };
    //console.log('Params to DB:' + JSON.stringify(params));
    documentClient.put(params, response);



};
