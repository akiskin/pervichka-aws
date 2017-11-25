'use strict';
const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = (event, context, callback) => {
  
  var now = new Date();           
  var filename = uuidv1();
  var path ='';

  function response(error, result) {
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({
        ok: error ? false : true,
        path: path, 
        filename: filename, 
        result: result, 
        errorText: error ? error.message : ''})
    };
    callback(null, response);
  }

  function register(error, result) {

    if (error) {
      callback(error);
      return;
    }

    path = result;

    var item = {
        id: filename,
        path: result,
        added: now.toISOString(),
        type: type,
        customer: code
    };

    var params = {
        TableName: process.env.TEMP_FILES_TABLE,
        Item: item
    };
    //console.log('Params to DB:' + JSON.stringify(params));
    documentClient.put(params, response);

  }

  var type;
  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) { 
    if (event.queryStringParameters.type !== undefined && event.queryStringParameters.type !== null && event.queryStringParameters.type !== "") { 
      type = event.queryStringParameters.type; 
    } 
  }

  var code;
  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) { 
    if (event.queryStringParameters.code !== undefined && event.queryStringParameters.code !== null && event.queryStringParameters.code !== "") { 
      code = event.queryStringParameters.code; 
    } 
  }

  if (type === undefined || code === undefined) {
    response(new Error('Required params missing'));
    return;
  }

  var s3 = new AWS.S3();
  
  var params = {
      Bucket: process.env.TEMP_FILES_BUCKET,
      Key: filename,
      Expires: 600
  };

  s3.getSignedUrl('putObject', params, register);

};
