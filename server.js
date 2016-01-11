'use strict';

import koa from 'koa';
import bodyParser from 'koa-body-parser';
import 'babel-polyfill';

let app = module.exports = koa();
app.use(bodyParser());

const port = process.env.PORT || 3000;
const account_sid = process.env.TWILIO_ACCOUNT_SID || console.log('WARN: SID not set!');
const auth_token = process.env.TWILIO_AUTH_TOKEN || console.log('WARN: TOKEN not set!');
const twilio_number = process.env.TWILIO_NUMBER || console.log('WARN: TWILIO_NUMBER not set!');
const client = require('twilio')(account_sid, auth_token);
const secretMessage = process.env.SECRET_MESSAGE || 'babydinosaur';

function sendSms(phone_number, message) {
  // This is all from the twilio-node package
  // https://twilio.github.io/twilio-node/

  client.sendMessage({
    to: phone_number,
    from: twilio_number,
    body: message
  }, (err, responseData) => {
    if (err) {
      console.log(err);
    }
  });
}

let phone_numbers = [];

app.use(function *() {
  // Store the phone number of anyone who sends us an SMS
  let sender = this.request.body.From;
  console.log(`Recieved SMS from ${sender}`);
  phone_numbers.push(sender);

  // If this person has sent the secret message, trigger a mass response
  if (this.request.body.Body === secretMessage) {
    console.log(`Recieved secret message from ${sender}`);
    // Make sure we don't have any duplicate numbers stored
    let phone_number_set = new Set();
    phone_numbers.forEach((item) => {
      phone_number_set.add(item);
    });
    // Send a message to everyone in our phone_number_set
    for (let phone_number of phone_number_set) {
      console.log(`Sending SMS to ${phone_number}`);
      sendSms(phone_number, 'This message is sent with code!');
    }
    // Drop our contacts list
    phone_numbers = [];
  }
  return;
});

app.listen(port);
