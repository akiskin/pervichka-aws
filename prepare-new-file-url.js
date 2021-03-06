'use strict';
const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = (event, context, callback) => {
  
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

  var docid;
  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) { 
    if (event.queryStringParameters.docid !== undefined && event.queryStringParameters.docid !== null && event.queryStringParameters.docid !== "") { 
      docid = event.queryStringParameters.docid; 
    } 
  }

  var doctype;
  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) { 
    if (event.queryStringParameters.doctype !== undefined && event.queryStringParameters.doctype !== null && event.queryStringParameters.doctype !== "") { 
      doctype = event.queryStringParameters.doctype; 
    } 
  } 

  if (type === undefined || code === undefined || docid === undefined || doctype === undefined) {
    response(new Error('Required params missing'));
    return;
  }

  var now = new Date();           
  var filename = uuidv1();
  var path ='';


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
    
    console.log(JSON.stringify(data));
    
    if (data.Item) { generateUrl(); }
    else { response(new Error('Customer not found')); }
        
  });  
  


  function generateUrl() {
    var s3 = new AWS.S3();
    var params = {
        Bucket: process.env.TEMP_FILES_BUCKET,
        Key: filename,
        Expires: 600
    };
    s3.getSignedUrl('putObject', params, register);
  }


  //Save generated URL to DB (TEMP_FILES_TABLE)
  function register(error, result) {

    if (error) { callback(error); return; }

    path = result;

    var item = {
        id: filename,
        path: path,
        added: now.toISOString(),
        type: type,
        customer: code,
        docid: docid,
        doctype: doctype
    };
    var params = {
        TableName: process.env.TEMP_FILES_TABLE,
        Item: item
    };
    documentClient.put(params, response);
  }

  //Handle overall output to API GW
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
        errorText: error ? error.message : ''})
    };
    callback(null, response);
  }

};
