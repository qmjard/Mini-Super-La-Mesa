const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  comprarProductos,
} = require('../controllers/productController');
const { protegerRuta, autorizarRoles } = require('../middleware/authMiddleware');

// rutas públicas
router.get('/', getProducts);
router.get('/:id', getProductById);

// compra simulada (requiere estar autenticado)
router.post('/comprar', protegerRuta, comprarProductos);

// rutas privadas (solo admin)
router.post('/', protegerRuta, autorizarRoles('admin'), createProduct);
router.put('/:id', protegerRuta, autorizarRoles('admin'), updateProduct);
router.delete('/:id', protegerRuta, autorizarRoles('admin'), deleteProduct);

module.exports = router;
