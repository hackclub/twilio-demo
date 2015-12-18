'use strict';

import koa from 'koa';
import bodyParser from 'koa-body-parser';
import 'babel-polyfill';

let app = module.exports = koa();
app.use(bodyParser());

const port = process.env.PORT || 3000;
const account_sid = process.env.TWILIO_ACCOUNT_SID || console.log('WARN: SID not set!');
const auth_token = process.env.TWILIO_AUTH_TOKEN || console.log('WARN: TOKEN not set!');
const twilio_number = process.env.TWILIO_NUMBER || console.log('WARN: TOKEN not set!');
const client = require('twilio')(account_sid, auth_token);
const secretMessage = process.env.SECRET_MESSAGE || 'babydinosaur';

function sendSms(phone_number, message) {
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
  phone_numbers.push(this.request.body.From);
  if (this.request.body.Body === secretMessage) {
    let phone_number_set = new Set();
    phone_numbers.forEach((item) => {
      phone_number_set.add(item);
    });
    for (let phone_number of phone_number_set) {
      sendSms(phone_number, 'This message is sent with code!');
    }
    phone_numbers = [];
  }
  this.body = 'success';
});

app.listen(port);
