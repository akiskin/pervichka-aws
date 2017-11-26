'use strict';
const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = (event, context, callback) => {

    var customerId = uuidv1();
    var now = new Date(); 
    
    var item = {
        id: customerId,
        added: now.toISOString(),
        balance: 0,
        activated: false,
        mail: undefined
    };  
    
    console.log(JSON.stringify(event));
    
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
    documentClient.put(params, cont);


    function response(error, result) {
        const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify({
            ok: error ? false : true,
            errorText: error ? error.message : ''})
        };
        callback(null, response);
    }

    function cont(error, result) {
        if (error) { response(error); return;}

        let ses = new AWS.SES({region: process.env.SES_REGION});
        
        let emailParams = {
            Destination: {
              BccAddresses: [],
              CcAddresses: [],
              ToAddresses: [item.mail]
            },
            Message: {
              Body: {
                Text: {
                  Data: `Hi there. Your access code = ${customerId}`,
                  Charset: "utf-8"
                }
              },
              Subject: {
                Data: "SES stuff",
                Charset: "utf-8"
              }
            },
            Source: process.env.EMAIL_FROM_ADDRESS,
            ReplyToAddresses: [process.env.EMAIL_FROM_ADDRESS]
        };        

        ses.sendEmail(emailParams, function (error, data) {
            if (error) { response(error); return;}
            
            //console.log(JSON.stringify(data));
            response(error, data);
        });
    }



};
