const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// registrar nuevo usuario
// post /api/auth/register
// acceso público
const registerUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Nombre, email y password son obligatorios',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const existeUsuario = await User.findOne({ email: email.toLowerCase() });
    if (existeUsuario) {
      return res.status(409).json({
        exito: false,
        mensaje: 'Ya existe un usuario registrado con ese email',
      });
    }

    // solo se permite crear rol admin si se envía una clave de sistema válida
    const rolFinal =
      rol === 'admin' && req.headers['x-admin-setup-key'] === process.env.ADMIN_SETUP_KEY
        ? 'admin'
        : 'cliente';

    const nuevoUsuario = await User.create({
      nombre,
      email,
      password,
      rol: rolFinal,
    });

    const token = generateToken(nuevoUsuario._id, nuevoUsuario.rol);

    return res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: nuevoUsuario,
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

// login de usuario
// post /api/auth/login
// acceso público
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Email y password son obligatorios',
      });
    }

    const usuario = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales inválidas',
      });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales inválidas',
      });
    }

    const token = generateToken(usuario._id, usuario.rol);

    return res.status(200).json({
      exito: true,
      mensaje: 'Login exitoso',
      token,
      usuario,
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

// obtener perfil del usuario autenticado
// get /api/auth/perfil
// acceso privado
const getPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
    }
    return res.status(200).json({ exito: true, usuario });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener perfil',
      error: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, getPerfil };
