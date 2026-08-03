require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');

// conectar a mongodb local
connectDB();

const app = express();

// middlewares base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// configuración de orígenes permitidos
const origenesPermitidos = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5500', // live server predeterminado
  'http://localhost:5500',
  'http://127.0.0.1:5501',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // en desarrollo (o peticiones de herramientas como postman sin origin), permite la conexión
      if (!origin || origenesPermitidos.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('No permitido por política de CORS'));
      }
    },
    credentials: true,
  })
);

// ruta de salud
app.get('/', (req, res) => {
  res.status(200).json({
    exito: true,
    mensaje: 'api minisuper la mesa funcionando correctamente',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ exito: true, estado: 'ok', timestamp: new Date().toISOString() });
});

// rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    exito: false,
    mensaje: `ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// manejo global de errores
app.use((err, req, res, next) => {
  console.error('error no manejado:', err.stack);

  if (err.message === 'No permitido por política de CORS') {
    return res.status(403).json({ exito: false, mensaje: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    exito: false,
    mensaje: err.message || 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`servidor minisuper la mesa corriendo en el puerto ${PORT}`);
});

module.exports = app;