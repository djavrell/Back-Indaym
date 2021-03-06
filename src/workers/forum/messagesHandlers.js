/**
 * Created by nicolas on 29/01/17.
 */

const waterline = require('waterline');
const paramHandler = require('../../middleware/paramHandler');
const errorHandler = require('../../middleware/errorHandler');

/**
 * Get a group of messages
 */
const getHandler = (req, res, next) => {
  req.app.models.message.find({
    topic: req.params.idTopic
  })
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
      errorHandler.errorExecutor(next);
    });
};

/**
 * Get only one message
 */
const getOneHandler = (req, res, next) => {
  req.app.models.message.findOne({
    topic: req.params.idTopic,
    uuid: req.params.idMessage
  })
    .then((results) => {
      if (results === undefined)
        errorHandler.errorExecutor(next, new errorHandler.errorCustom(404, "Message not found"));
      else
        res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
      errorHandler.errorExecutor(next);
    });
};

/**
 * Create a message
 */
const postHandler = (req, res, next) => {
  let createObj = paramHandler.paramExtract(req.body, ['title', 'message', 'answerTo']);
  createObj.topic = req.params.idTopic;
  createObj.owner = '4d24a2d2-0ab5-4348-a779-672eb557a6be';
  req.app.models.message.create(createObj)
    .then((results) => {
      res.status(201).json({uuid : results.uuid});
    })
    .catch((err) => {
      console.log(err);
      errorHandler.errorExecutor(next);
    });
};

/**
 * Update an existing message
 */
const putHandler = (req, res, next) => {
  let updateObj = paramHandler.paramExtract(req.body, ['title', 'description', 'up', 'down']);
  req.app.models.message.update({
    topic: req.params.idTopic,
    uuid: req.params.idMessage
  },updateObj)
    .then((results) => {
      if (results.length == 0)
        errorHandler.errorExecutor(next, new errorHandler.errorCustom(403, "Can't update this message"));
      else
        res.status(200).json({ status: 'ok' });
    })
    .catch((err) => {
      console.log(err);
      errorHandler.errorExecutor(next);
    });
};

/**
 * Delete an existing message
 */
const deleteHandler = (req, res, next) => {
  req.app.models.message.destroy({
    uuid: req.params.idMessage
  })
    .then((results) => {
      if (results.length == 0)
        errorHandler.errorExecutor(next, new errorHandler.errorCustom(403, "Can't delete this message"));
      else
        res.status(200).json({ status: 'ok' });
    })
    .catch((err) => {
      errorHandler.errorExecutor(next);
    });
};


module.exports = {
  getHandler,
  getOneHandler,
  postHandler,
  putHandler,
  deleteHandler,
};
