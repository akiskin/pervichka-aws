'use strict';
const AWS = require('aws-sdk');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = (event, context, callback) => {
  
    function response(error, result) {
        console.log(JSON.stringify(result));

        const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify({
            ok: error ? false : true,
            result: error ? undefined : result.Items, 
            errorText: error ? error.message : ''})
        };
        callback(null, response);
    }

    var code;
    if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) { 
        if (event.queryStringParameters.code !== undefined && event.queryStringParameters.code !== null && event.queryStringParameters.code !== "") { 
        code = event.queryStringParameters.code; 
        } 
    }

    if (code === undefined) {
        response(new Error('Required params missing'));
        return;
    }

    var params = {
        TableName: process.env.UPLOADED_FILES_TABLE,
        IndexName: "customer-index",
        KeyConditionExpression: "customer = :code",
        ExpressionAttributeValues: {
            ":code": code
        }        

    };
    console.log('Params to DB:' + JSON.stringify(params));
    documentClient.query(params, response);

};
