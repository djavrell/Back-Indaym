/**
 * Created by djavrell on 10/01/17.
 */

const waterline = require('waterline');

const errorHandler = require('../../../src/middleware/errorHandler');
const fieldsIsValid = require('../../helpers/authHelper').dataIsValid;
const logFunc = require('../../helpers/authHelper').logFunc;
const newUser = require('../../helpers/authHelper').newUser;
const extract = require('../../helpers/authHelper').extractInfo;
const extractBrute = require('../../helpers/authHelper').extractInfoBrute;
const tokenWorker = require('../../workers/auth/token');

const register = (req, res) => {
  const data = req.body.data;
  const userCollection = req.app.models.user;

  if (fieldsIsValid(data)) {
    return res.status(403).json({ status: 'error', code: 'forbidden' });    
  }

  userCollection.findOne()
    .where({ username: data.username })
    .then((user) => {
      if (user === undefined) {
        
        userCollection
          .create(newUser(data))
          .then((newUser) => {
            return res.status(202).json({ status: 'created', code: `user ${newUser.username} created` });
          })
          .catch((err) => logFunc(err, res.status(400).json({ status: 'error', code: 'bad request' })));

      } else {
        return res.status(403).json({ status: 'error', code: `user ${user.username} already exist` });
      }
    })
    .catch((err) => logFunc(err, res.status(500).json({ status: 'error', code: 'server error' })))
};

const login = (req, res) => {
  const data = req.body;
  const userCollection = req.app.models.user;

  if (fieldsIsValid(data))
    return res.status(403).json({ status: 'error', code: 'forbidden' });

  const query = extract({iss: data.username, pwd: data.password, email: data.email });
  userCollection.findOne()
    .where(query)
    .then((user) => {

      if (user === undefined)
        return res.status(403).json({ status: 'error', code: 'Username, email or password is wrong' });

      const token = tokenWorker.generateToken(tokenWorker.dataFromUser(user), tokenWorker.generateOpt());

      userCollection.update( { uuid: user.uuid }, { isConnected: true, token: token } )
        .then((results) => {
          if (results.length === 0)
            return res.status(403).json({ status: 'error', code: 'Error while login procedure'});
          return res.status(200).json({status: 'ok', token: token});
        })
        .catch((err) => logFunc(err, res.status(500).json({ status: 'error', code: 'server error' })));

    })
    .catch((err) => logFunc(err, res.status(500).json({ status: 'error', code: 'server error' })));
};

const logout = async (req, res) => {
  const userCollection = req.app.models.user;

  const token = req.get('Authorization').split(' ').slice(1)[0];
  if (token === undefined)
    return res.status(403).json({ status: 'error', code: 'forbidden' });

  const payload = tokenWorker.decodeAuthToken(token);
  if (payload === undefined)
    return res.status(403).json({ status: 'error', code: 'no data'});

  try {
    const user = await userCollection.findOne().where(extractBrute(payload));
    const result = await userCollection.update({ uuid: user.uuid }, { isConnected: false, token: null });
    if (result.length === 0) {
      return res.status(403).json({ status: 'error', code: 'Error while logout procedure'});    
    }
    return res.status(200).json({ status: 'ok' });  
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 'error', code: 'server error' });
  }
};

const authenticated = (req, res) => {
  return res.status(200).json({ authenticated: 'yes' });
};

module.exports = {
  login,
  logout,
  authenticated,
  register,
};
