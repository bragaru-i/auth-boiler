const express = require('express');
const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error-controller');
const usersRoutes = require('./routes/users-routes');

const app = express();
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));

// Apply routes to server
app.use('/api/v1/users', usersRoutes);

// Error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server `, 404));
});

app.use(globalErrorHandler);

module.exports = app;
