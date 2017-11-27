'use strict';
const AWS = require('aws-sdk');
var documentClient = new AWS.DynamoDB.DocumentClient();

//module.exports.main = (event, context, callback) => { #this is deployed by hand, not by serverless
exports.handler = (event, context, callback) => {

  var now = new Date();           

  //Query temp db
  var params = {
    TableName : "temp-urls-pervichka-aws-dev",
    Key: {
      id: event.Records[0].s3.object.key
    },
    AttributesToGet: ['id','type','customer','doctype','docid']
  };

  documentClient.get(params, function(error, data) {
    if (error) response(error);
    else putNewEntry(data);
  });  

  function putNewEntry(dbentry) {
    if (dbentry === null || dbentry.Item === undefined) {
      response(new Error('TEMP FILE DATA NOT FOUND'));
      return;
    }

    var item = {
        id: dbentry.Item.id,
        customer: dbentry.Item.customer,
        type: dbentry.Item.type,
        size: event.Records[0].s3.object.size,
        added: now.toISOString(),
        docid: dbentry.Item.docid,
        doctype: dbentry.Item.doctype
    };
    var params = {
        TableName: "uploaded-urls-pervichka-aws-dev",
        Item: item
    };
    documentClient.put(params, response);
  }

  function response(error, result) {
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({result: result, error: error})
    };
    callback(null, response);
  } 
};
