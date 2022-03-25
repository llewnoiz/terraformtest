const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const hpp = require('hpp');
const helmet = require('helmet');
// const { sequelize } = require('./entities');
// const mongoose = require('mongoose');
const logger = require('./utils/log');
const launcherRouter = require('./routes/launcher.router');

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 8110);

// sequelize.sync({ force: false })
//     .then(() => {
//         console.info('db connection success');
//     })
//     .catch((err) => {
//         console.error(err);
//     });

// mongoose
//     .connect(MONGO_HOST, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Successfully connected to mongodb'))
//     .catch(e => console.error(e));
app.use(express.static(__dirname +'/template'));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet({
    contentSecurityPolicy: false,
  }));
app.use(hpp());
app.use(cors());

app.use('/launcher', launcherRouter);

app.use((req, res, next) => {
    const error =  new Error();
    error.status = 404;
    error.message = "router not found";
    logger.error(error);
    next(error);
});

app.use((err, req, res, next) => {
    logger.error(error);
    res.status(err.status || 500).send({ "message" : err?.message , "code" : err?.status});
});

module.exports = app;







