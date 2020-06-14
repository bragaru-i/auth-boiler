const path = require('path');
require('dotenv').config({ path: path.join('config.env') });
// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
const mongoose = require('mongoose');
// switching DB
let DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const DB_LOCAL = process.env.DATABASE_LOCAL;

// connect to DB
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('***DB connected succesfully***');
  })
  .catch((err) => console.log('***Not logged DB***', err));

//   Connect to server
const port = process.env.PORT;
console.log('Mode:', process.env.NODE_ENV);
const server = app.listen(port, () => {
  console.log(`***Server started on ${port} port ...***`);
});

// unhandled rejectons
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
