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
      body: JSON.stringify({path: path, filename: filename, result: result, error: error})
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
        added: now.toISOString()
    };

    var params = {
        TableName: process.env.TEMP_FILES_TABLE,
        Item: item
    };
    //console.log('Params to DB:' + JSON.stringify(params));
    documentClient.put(params, response);

  }



  var s3 = new AWS.S3();
  
  var params = {
      Bucket: process.env.TEMP_FILES_BUCKET,
      Key: filename,
      Expires: 600
  };

  s3.getSignedUrl('putObject', params, register);

};
