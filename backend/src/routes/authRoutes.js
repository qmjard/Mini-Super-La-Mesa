const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getPerfil } = require('../controllers/authController');
const { protegerRuta } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/perfil', protegerRuta, getPerfil);

module.exports = router;
