const mongoose = require('mongoose');
const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env;

// Elegir entre la DB de testing o la de desarrollo/produccion.
const isTest = NODE_ENV === 'test';
const connectionString = isTest ? MONGO_DB_URI_TEST : MONGO_DB_URI;

// Para que solo entre en la DB lo que esta especificado en el Schema correspondiente.
mongoose.set('strictQuery', true);

mongoose
  .connect(connectionString)
  .then(() => console.log(isTest ? 'DB Testing conectada' : 'DB conectada'))
  .catch(err => console.log(err));

process.on('uncaughtException', () => mongoose.disconnect());