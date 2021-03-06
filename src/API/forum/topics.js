/**
 * Created by nicolas on 29/01/17.
 */

const express = require('express');
const topicsWorkers = require('../../workers/forum/topicsHandlers');
const topicsCheckers = require('../../checkers/forum/topicsCheckers');
const paramsHandlers = require('../../checkers/forum/paramsHandlers');
const config = require('../../../config/config');
const messages = require('./messages');

const topicsRouter = express.Router(config.routerConfig);

topicsRouter.param('idTopic', paramsHandlers.idTopic);

topicsRouter.route('/')
  .get(topicsWorkers.getHandler)
  .post([topicsCheckers.postChecker, topicsWorkers.postHandler]);

topicsRouter.route('/:idTopic')
  .get(topicsWorkers.getOneHandler)
  .put(topicsWorkers.putHandler)
  .delete(topicsWorkers.deleteHandler);

topicsRouter.use('/:idTopic/messages/', messages.messagesRouter);

module.exports = {
  topicsRouter,
};

/**
 * forum/:idForum/topics/
 * forum/:idForum/topics/:idTopic/
 */