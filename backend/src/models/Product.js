const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
      maxlength: [120, 'El nombre no puede exceder 120 caracteres'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: [
        'Frutas y Verduras',
        'Lácteos',
        'Carnes',
        'Panadería',
        'Abarrotes',
        'Bebidas',
        'Limpieza',
        'Otros',
      ],
      default: 'Otros',
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    imagenUrl: {
      type: String,
      default: 'https://via.placeholder.com/300x300.png?text=Minisuper+La+Mesa',
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
      default: '',
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ nombre: 'text', categoria: 'text' });

module.exports = mongoose.model('Product', productSchema);
