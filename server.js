const express = require('express');
const waterline = require('waterline');
const cors = require('cors');

const bodyParser = require('body-parser');
const methodOverRide = require('method-override');
const DBconfig = require('./config/waterlineConfig').DBconfig;

const routes = require('./src/routes/routes');
const collections = require('./src/models');

const app = express();
const orm = waterline();

/**
 * middleware import
 */
const middleware = require('./src/middleware');

/**
 * load each model in waterline
 */
orm.loadCollection(collections.Forum);
orm.loadCollection(collections.Topics);
orm.loadCollection(collections.Messages);

/**
 * load of all middleware we need
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverRide());
app.use(cors());

app.use(middleware.logCall);

app.use('/api', express.static('api'));

/**
 * router loading
 */
app.use('/forum', routes.forumRouter);

app.get('/', (req, res) => {
  res.send("hello world!");
});

orm.initialize(DBconfig, (err, models) => {
  if (err) console.log(err);

  app.models = models.collections;
  app.connections = models.connections;

  app.listen(4000, () => {
    console.log("listen on port 4000");
  });

});
