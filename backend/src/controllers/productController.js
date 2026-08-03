const Product = require('../models/Product');

// obtener todos los productos (con filtros opcionales)
// get /api/products?categoria=&buscar=&pagina=&limite=
// acceso público
const getProducts = async (req, res) => {
  try {
    const { categoria, buscar, pagina = 1, limite = 20 } = req.query;

    const filtro = { activo: true };
    if (categoria) filtro.categoria = categoria;
    if (buscar) filtro.$text = { $search: buscar };

    const skip = (Number(pagina) - 1) * Number(limite);

    const [productos, total] = await Promise.all([
      Product.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(Number(limite)),
      Product.countDocuments(filtro),
    ]);

    return res.status(200).json({
      exito: true,
      total,
      pagina: Number(pagina),
      totalPaginas: Math.ceil(total / Number(limite)),
      productos,
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener productos',
      error: error.message,
    });
  }
};

// obtener un producto por id
// get /api/products/:id
// acceso público
const getProductById = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }
    return res.status(200).json({ exito: true, producto });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el producto',
      error: error.message,
    });
  }
};

// crear un producto
// post /api/products
// acceso privado (admin)
const createProduct = async (req, res) => {
  try {
    const { nombre, categoria, precio, stock, imagenUrl, descripcion } = req.body;

    if (!nombre || !categoria || precio === undefined || stock === undefined) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Nombre, categoría, precio y stock son obligatorios',
      });
    }

    const producto = await Product.create({
      nombre,
      categoria,
      precio,
      stock,
      imagenUrl,
      descripcion,
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Producto creado exitosamente',
      producto,
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al crear el producto',
      error: error.message,
    });
  }
};

// actualizar un producto
// put /api/products/:id
// acceso privado (admin)
const updateProduct = async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!producto) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Producto actualizado exitosamente',
      producto,
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar el producto',
      error: error.message,
    });
  }
};

// eliminar un producto (borrado lógico)
// delete /api/products/:id
// acceso privado (admin)
const deleteProduct = async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Producto eliminado exitosamente',
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar el producto',
      error: error.message,
    });
  }
};

// simular una compra: reduce el stock de varios productos de forma atómica
// post /api/products/comprar
// body { items: [{ productoId, cantidad }, ...] }
// acceso privado (cliente/admin)
const comprarProductos = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Debes enviar al menos un producto en "items"',
    });
  }

  try {
    const resultados = [];
    let totalCompra = 0;

    // se procesa cada item de forma atómica usando el operador $inc
    // con una condición de stock suficiente, evitando condiciones de carrera.
    for (const item of items) {
      const { productoId, cantidad } = item;

      if (!productoId || !cantidad || cantidad <= 0) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Cada item requiere productoId y cantidad válida (> 0)',
        });
      }

      const productoActualizado = await Product.findOneAndUpdate(
        { _id: productoId, activo: true, stock: { $gte: cantidad } },
        { $inc: { stock: -cantidad } },
        { new: true }
      );

      if (!productoActualizado) {
        return res.status(409).json({
          exito: false,
          mensaje: `Stock insuficiente o producto no disponible (ID: ${productoId})`,
        });
      }

      const subtotal = productoActualizado.precio * cantidad;
      totalCompra += subtotal;

      resultados.push({
        productoId: productoActualizado._id,
        nombre: productoActualizado.nombre,
        cantidad,
        precioUnitario: productoActualizado.precio,
        subtotal,
        stockRestante: productoActualizado.stock,
      });
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Compra realizada exitosamente. Stock actualizado',
      totalCompra,
      detalle: resultados,
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al procesar la compra',
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  comprarProductos,
};
