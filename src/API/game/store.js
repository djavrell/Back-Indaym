/**
 * Created by nicolas on 23/01/17.
 */

/**
 * /store/
 * /store/:idPublicGame
 */

const express = require('express');
const storeWorkers = require('../../workers/game/storeHandlers');
const paramsHandlers = require('../../checkers/game/paramsHandlers');
const config = require('../../../config/config');
const {
  queryParams,
} = require('../../middleware');

const storeRouter = express.Router(config.routerConfig);

storeRouter.param('idPublicGame', paramsHandlers.idPublicGame);

storeRouter.route('/')
  .get([
    queryParams.orderBy,
    queryParams.pagination,
    storeWorkers.getHandler
  ]);

storeRouter.route('/count')
  .get([
    queryParams.orderBy,
    queryParams.pagination,
    storeWorkers.getCounter
  ]);

storeRouter.route('/:idPublicGame')
  .post(storeWorkers.postHandler)
  .delete(storeWorkers.deleteHandler);

module.exports = {
  storeRouter
};