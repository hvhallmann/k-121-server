const express = require('express');

const router = express.Router();
const Person = require('../models/person');
const { check, body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

router.post('/create', [
  // Validate that the name field is not empty.
  body('name', 'name required').isLength({ min: 1 }).trim(),
  body('email', 'email required').isLength({ min: 1 }).trim(),
  check('email').isEmail().withMessage('Must be an email'),
  sanitizeBody('name').trim().escape(),
  sanitizeBody('email').trim().escape(),
], (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }
  // Create an instance of model SomeModel
  const personInstance = new Person({
    name: req.body.name,
    email: req.body.email,
  });

  // Save the new model instance, passing a callback
  personInstance.save((err, person) => {
    if (err) return next(err);
    res.status(200).json(person);
  });
});

router.put('/update/:id', [
  body('name', 'name required').isLength({ min: 1 }).trim(),
  body('email', 'email required').isLength({ min: 1 }).trim(),
  check('email').isEmail().withMessage('Must be an email'),
  check('id').isMongoId(),
  sanitizeBody('name').trim().escape(),
  sanitizeBody('email').trim().escape(),
], (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const personInstance = new Person({
    _id: req.params.id,
    name: req.body.name,
    email: req.body.email,
  });

  Person.findByIdAndUpdate(req.params.id, personInstance, (err, person) => {
    if (err) return next(err);
    res.status(200).json(person);
  });
});

router.get('/list', (req, res, next) => {
  Person.find()
  .sort([['name', 'ascending']])
  .exec((err, personList) => {
    if (err) { return next(err); }
    res.status(200).json(personList);
  });
});

router.get('/list/:id', [
  check('id').isMongoId(),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }
  Person.find({ _id: req.params.id })
  .exec((err, personList) => {
    if (err) { return next(err); }
    res.status(200).json(personList);
  });
});


router.delete('/delete/:id', [
  check('id').isMongoId(),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  // Save the new model instance, passing a callback
  Person.findByIdAndRemove(req.params.id, (err, person) => {
    if (err) return next(err);
    res.status(200).json(person);
  });
});

module.exports = router;
