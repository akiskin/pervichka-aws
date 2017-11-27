'use strict';
const AWS = require('aws-sdk');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = (event, context, callback) => {
  
  var id;
  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) { 
    if (event.queryStringParameters.id !== undefined && event.queryStringParameters.id !== null && event.queryStringParameters.id !== "") { 
      id = event.queryStringParameters.id; 
    } 
  }

  var code;
  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) { 
    if (event.queryStringParameters.code !== undefined && event.queryStringParameters.code !== null && event.queryStringParameters.code !== "") { 
      code = event.queryStringParameters.code; 
    } 
  }

  if (id === undefined || code === undefined) {
    response(new Error('Required params missing'));
    return;
  }

  //check CUSTOMER_ID (code) validity
  var params = {
    TableName : process.env.CUSTOMERS_TABLE,
    Key: {
      id: code
    },
    AttributesToGet: ['id','active']
  };

  documentClient.get(params, function(error, data) {
    if (error) { response(error); return; }
    
    if (data.Item) { generateUrl(); }
    else { response(new Error('Customer not found')); }
  });

  function generateUrl() {
    var s3 = new AWS.S3();
    var params = {
        Bucket: process.env.TEMP_FILES_BUCKET,
        Key: id,
        Expires: 600
    };
    s3.getSignedUrl('getObject', params, response);
  }

  function response(error, result) {
    if (error) {
      const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({
          ok: false,
          errorText: error.message})
      };
      callback(null, response);
    } else {
      const response = {
        statusCode: 302,
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
            "Location" : result
        } 
      };
      callback(null, response);
    }
  }
};
