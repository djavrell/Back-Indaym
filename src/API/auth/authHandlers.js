/**
 * Created by djavrell on 10/01/17.
 */

const waterline = require('waterline');

const errorHandler = require('../../../src/middleware/errorHandler');
const fieldsIsValid = require('../../helpers/authHelper').dataIsValid;
const logFunc = require('../../helpers/authHelper').logFunc;
const newUser = require('../../helpers/authHelper').newUser;
const extract = require('../../helpers/authHelper').extractInfo;
const createRes = require('../../helpers').createRes;
const extractBrute = require('../../helpers/authHelper').extractInfoBrute;
const tokenWorker = require('../../workers/auth/token');

const register = async (req, res) => {
  const userCollection = req.app.models.user;

  try {
    const createdUser = await userCollection.create(newUser(req.body.data));
    return createRes(res, 202, { status: 'created', code: `user ${createdUser.username} created` });
  } catch (err) {
    return logFunc(err, createRes(res, 400, { status: 'error', code: 'bad request' }));
  }
};

const login = async (req, res) => {
  const userCollection = req.app.models.user;
  const user = req.user;

  try {
    const token = tokenWorker.generateToken(tokenWorker.dataFromUser(user), tokenWorker.generateOpt());

    const result = await userCollection.update( { uuid: user.uuid }, { isConnected: true, token: token } );
    if (result.length === 0)
      return createRes(403, { status: 'error', code: 'Error while login procedure'});      

    return createRes(res, 200, {status: 'ok', token: token});
  } catch (err) {
    logFunc(err, createRes(res, 500));
  }
};

const logout = async (req, res) => {
  const userCollection = req.app.models.user;

  try {
    const result = await userCollection.update({ uuid: req.user.uuid }, { isConnected: false, token: null });
    if (result.length === 0) {
      return createRes(res, 403, { status: 'error', code: 'Error while logout procedure'});    
    }
    return createRes(res, 200);  
  } catch (err) {
    return logFunc(err, createRes(res, 500));
  }
};

const authenticated = (req, res) => {
  return createRes(res, 200, { authenticated: 'yes' });
};

const refresh = (req, res) => {
  const refreshToken = req.get('refreshToken');
  if (!refreshToken)
    return createRes(res, 400, { status: 'error', code: 'missing refresh token' });
};

module.exports = {
  login,
  logout,
  authenticated,
  register,
  refresh,
};
