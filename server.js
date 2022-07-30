const mongoose = require('mongoose');

const dotenv = require('dotenv');

// before calling any service
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });

const app = require('./app');

const port = process.env.PORT || 3000;
const dbConnectString = process.env.MONGODB_URL.replace('<PASSWORD>', process.env.MONGO_PASSWORD);

mongoose
  .connect(dbConnectString, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database Connected'));

const server = app.listen(port, () => {
  console.log(`App listening on Port:${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
