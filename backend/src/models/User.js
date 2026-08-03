const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [80, 'El nombre no puede exceder 80 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false,
    },
    rol: {
      type: String,
      enum: ['admin', 'cliente'],
      default: 'cliente',
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// encriptar password antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// comparar password ingresado con el hash almacenado
userSchema.methods.compararPassword = async function (passwordIngresado) {
  return bcrypt.compare(passwordIngresado, this.password);
};

// no exponer el password en json
userSchema.methods.toJSON = function () {
  const usuario = this.toObject();
  delete usuario.password;
  delete usuario.__v;
  return usuario;
};

module.exports = mongoose.model('User', userSchema);
