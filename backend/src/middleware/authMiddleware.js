const jwt = require('jsonwebtoken');
const User = require('../models/User');

// verifica que exista un token jwt válido en el header authorization
const protegerRuta = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado. Token no proporcionado',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado. Usuario no válido',
      });
    }

    req.usuario = { id: usuario._id.toString(), rol: usuario.rol };
    next();
  } catch (error) {
    return res.status(401).json({
      exito: false,
      mensaje: 'No autorizado. Token inválido o expirado',
    });
  }
};

// restringe el acceso solo a ciertos roles. uso: soloadmin('admin')
const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Acceso denegado. No tienes permisos suficientes',
      });
    }
    next();
  };
};

module.exports = { protegerRuta, autorizarRoles };
