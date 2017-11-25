'use strict';
const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = (event, context, callback) => {

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

    var now = new Date(); 
    
    var item = {
        id: uuidv1(),
        added: now.toISOString(),
        balance: 0,
        activated: false,
        mail: undefined
    };              

    if (event.body !== null) {
        var payload = JSON.parse(event.body);
        if (payload.hasOwnProperty("firstname")) { item.firstname = payload.firstname;}
        if (payload.hasOwnProperty("middlename")) { item.middlename = payload.middlename;}
        if (payload.hasOwnProperty("lastname")) { item.lastname = payload.lastname;}
        if (payload.hasOwnProperty("fullname")) { item.fullname = payload.fullname;}

        if (payload.hasOwnProperty("mail")) { item.mail = payload.mail;}
        if (payload.hasOwnProperty("phone")) { item.phone = payload.phone;}
        if (payload.hasOwnProperty("workplace")) { item.workplace = payload.workplace;}
    }

    if (item.mail === undefined) {
        resonse(new Error("Email not present"));
        return;
    }


    var params = {
        TableName: process.env.CUSTOMERS_TABLE,
        Item: item
    };
    //console.log('Params to DB:' + JSON.stringify(params));
    documentClient.put(params, response);
};
