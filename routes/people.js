const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();
const Person = require('../models/person');
const secret = require('../lib/secretSanta.js');

function sortAndUpdateFriendMail() {
  return Person.find()
  .exec((mongoErr, personList) => {
    if (mongoErr) { return console.error(mongoErr); }
    const pList = personList.map(p => p.email);
    const scrambleNames = secret(pList);
    personList.forEach((p) => {
      Person.findByIdAndUpdate(p._id, { $set: { amigo: scrambleNames[p.email] } });
    });
    return scrambleNames;
  });
}

const createTransport = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.USER_EMAIL || 'ep3zjnxbgftu7w3y@ethereal.email', // generated ethereal user
    pass: process.env.MAIL_PASS || 'wjUHJAG5gvDAe9SHxC', // generated ethereal password
  },
});

function sendMails(next, mailOptions) {
  // send mail with defined transport object
  createTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return next(error);
    }
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
}

router.post('/send-emails', (req, res, next) => {
  console.log('sending mails ...');
  return nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport

    sortAndUpdateFriendMail()
    .then((personMap) => {
      personMap.forEach(per => {
        // setup email data with unicode symbols
        const mailOptions = {
          from: '"Secret Santa 👻" <secretsanta@example.com>', // sender address
          to: `${per.email}`, // list of receivers
          subject: 'Hello Secret Friend ✔', // Subject line
          text: `Hello ${per.name}, your selected fried after sortition is ${per.amigo}`, // plain text body
          html: `<b>Hello ${per.name}, your selected fried after sortition is ${per.amigo}</b>`, // html body
        };

        sendMails(next, mailOptions);
      });
      res.status(200).json({ msg: 'mail sent' });
    });
  });
});

module.exports = router;
