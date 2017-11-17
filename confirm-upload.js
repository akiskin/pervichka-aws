'use strict';
const AWS = require('aws-sdk');
var documentClient = new AWS.DynamoDB.DocumentClient();

//module.exports.main = (event, context, callback) => {
exports.handler = (event, context, callback) => {

  var now = new Date();           

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

  function putNewEntry(dbentry) {
    console.log('dbentry:' + JSON.stringify(dbentry));

    if (dbentry === null || dbentry.Item === undefined) {
      response(new Error('TEMP FILE DATA NOT FOUND'));
      return;
    }

    var item = {
        id: dbentry.Item.id,
        owner: dbentry.Item.owner,
        type: dbentry.Item.type,
        size: event.Records[0].s3.object.size,
        added: now.toISOString()
    };

    var params = {
        TableName: "uploaded-urls-pervichka-aws-dev",
        Item: item
    };
    //console.log('Params to DB:' + JSON.stringify(params));
    documentClient.put(params, response);
  }

  //Query temp db
  var params = {
    TableName : "temp-urls-pervichka-aws-dev",
    Key: {
      id: event.Records[0].s3.object.key
    },
    AttributesToGet: ['id','type','owner']
  };

  documentClient.get(params, function(err, data) {
    if (err) response(err);
    else putNewEntry(data);
  });  


};
