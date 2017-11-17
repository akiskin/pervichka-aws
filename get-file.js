'use strict';
const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = (event, context, callback) => {
 
  function response(error, result) {
    if (error) {
        
        const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify({
            ok: true,
            errorText: error.message})
        };
        callback(null, response);
        
    } else {

        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
                "Content-type" : result.ContentType,
                "Content-Length" : result.ContentLength
            },
            body: result.Body.toString('base64'),
            isBase64Encoded: true
        };
        callback(null, response);

    }
  }


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

  var s3 = new AWS.S3();
  
  var params = {
      Bucket: process.env.TEMP_FILES_BUCKET,
      Key: id
  };

  s3.getObject(params, response);

};
