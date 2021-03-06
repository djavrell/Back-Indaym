/**
 * Created by djavrell on 04/02/2017.
 */
const digest = require('../../scripts/hash_generator').digest;
const tokenWorker = require('../workers/auth/token');
const {
  token,
  getUser,
  header,
  trace,
} = require('../middleware');

const dataIsValid = (data, opt) => {
  const errors = {
    error: false,
    message: [],
  }

  opt.map((item) => {
    if (!data || !data[item]) {
      errors.error = true;
      errors.message.push(`${item} is missing`);
    }
  });

  return errors;
};

const newToken = (payload, opt) => {
  const options = opt ? tokenWorker.generateOpt(opt) : tokenWorker.generateOpt();
  return tokenWorker.generateToken(payload, options);
}

const newUser = (data) => {
  return {
    username: data.username,
    password: digest(data.password),
    email: data.email,
  };
};

const extractInfo = ({iss, pwd, email, }) => {
  return {
    username: iss,
    password: digest(pwd),
    email: email,
  };
}

const extractInfoBrute = ({iss, pwd, email, }) => {
  return {
    username: iss,
    password: pwd,
    email: email,
  };
}

const extract = (opt, {iss, pwd, email, }) => {
  const base = { digest: true, username: true };
  opt = {...base, ...opt};
  const obj = {
    password: opt.digest ? digest(pwd) : pwd,
    email: email,
  };
  if (opt.username) obj.username = iss;
  return obj;
}

const getTokenFromReq = () => [
  header.getHeader('Authorization', (header) => header.split(' ').slice(1)[0]),
  token.extractToken(),
  token.tokenIsValide('Authorization'),
  getUser.getUserFromToken,
]

module.exports = {
  dataIsValid,
  newUser,
  newToken,
  extract,
  extractInfo,
  extractInfoBrute,
  getTokenFromReq,
};
