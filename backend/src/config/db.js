require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('La variable MONGO_URI no está definida en el archivo .env');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`mongodb local conectado correctamente: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`error al conectar mongodb local: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('error en la conexión de mongodb:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('mongodb desconectado.');
});

module.exports = connectDB;