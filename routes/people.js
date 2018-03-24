const express = require('express');

const router = express.Router();

router.post('/send-emails', (req, res, next) => {
  console.log('sendingngn----');
  // retur res.status(200);
  next();
});

module.exports = router;
