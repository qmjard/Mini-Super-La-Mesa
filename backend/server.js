require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');

// Conectar a MongoDB Atlas
connectDB();

const app = express();

// Middlewares base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configurado para el frontend en Vercel (producción + previews) y desarrollo local
const origenesPermitidos = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

// Patrón para aceptar automáticamente los preview deployments de Vercel
// (ej: mini-super-la-mesa-rcgd6x1od-qmjard1.vercel.app), además del dominio
// de producción fijo en CLIENT_URL. Ajusta el prefijo si cambia el nombre del proyecto.
const patronPreviewVercel = /^https:\/\/mini-super-la-mesa(-[a-z0-9]+)*\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      const esPermitido =
        !origin ||
        origenesPermitidos.includes(origin) ||
        patronPreviewVercel.test(origin);

      if (esPermitido) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por política de CORS'));
      }
    },
    credentials: true,
  })
);

// Ruta de salud (útil para Render)
app.get('/', (req, res) => {
  res.status(200).json({
    exito: true,
    mensaje: 'API Minisuper La Mesa funcionando correctamente 🥬🍊',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ exito: true, estado: 'ok', timestamp: new Date().toISOString() });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    exito: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.stack);

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
  console.log(`🚀 Servidor Minisuper La Mesa corriendo en el puerto ${PORT}`);
});

module.exports = app;
