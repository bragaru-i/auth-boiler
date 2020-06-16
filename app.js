const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error-controller');
const usersRoutes = require('./routes/users-routes');

const app = express();
// Set security HTTP headers
app.use(helmet());

// Limit request from same IP on api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests fromm this IP. Please try again in 1 hour',
});

app.use('/api', limiter);

// Parsing body req.body
app.use(bodyParser.json({ limit: '10kb' }));

// Data sanitization against NoSql injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Apply routes to server
app.use('/api/v1/users', usersRoutes);

// Error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server `, 404));
});

app.use(globalErrorHandler);

module.exports = app;
