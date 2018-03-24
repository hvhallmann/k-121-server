const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();
const Person = require('../models/person');
const secret = require('../lib/secretSanta.js');

router.post('/sort', (req, res, next) => {
  Person.find()
  .exec((mongoErr, personList) => {
    if (mongoErr) { return next(mongoErr); }
    const pList = personList.map(p => p.email);
    const scrambleNames = secret(pList);
    personList.forEach((p) => {
      Person.findByIdAndUpdate(p._id, { $set: { amigo: scrambleNames[p.email] } }, (err, person) => {
        if (err) return next(err);
        return console.log('selected friend', person);
      });
    });
    res.status(200).json(personList);
  });
});

router.post('/send-emails', (req, res, next) => {
  console.log('sending mails ...');
  return nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'ep3zjnxbgftu7w3y@ethereal.email', // generated ethereal user
        pass: 'wjUHJAG5gvDAe9SHxC', // generated ethereal password
      },
    });

    Person.find()
    .exec((mongoErr, personList) => {
      if (mongoErr) { return next(mongoErr); }
      console.log('pers', personList);
      const scrambleNames = scramble(personList);
      personList.forEach((one, index) => {
        const personInstance = new Person({
          _id: one._id,
          amigo: scrambleNames[index].email,
        });
        Person.findByIdAndUpdate(one._id, personInstance, (errUpd, person) => {
          if (errUpd) return next(err);
          console.log('selected friend', person);
        });
        res.status(200).json(personList);
      });
    });

    // setup email data with unicode symbols
    const mailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: 'bar@example.com, baz@example.com', // list of receivers
      subject: 'Hello ✔', // Subject line
      text: 'Hello world?', // plain text body
      html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return next(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.status(200).json(info);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  });
});

module.exports = router;
