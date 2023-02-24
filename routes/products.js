const router = require('express').Router();
const Product = require('../database/models/Product');
const {
  verifyTokenAndAdmin
} = require('../middlewares/verifyToken');

// Crear producto
router.post('/', verifyTokenAndAdmin, async (req, res, next) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Modificar producto
router.put('/:id', verifyTokenAndAdmin, async (req, res, next) => {
  let { body } = req;
  const { id } = req.params;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: body
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Eliminar producto
router.delete('/:id', verifyTokenAndAdmin, async (req, res, next) => {
  const { id } = req.params;

  try {
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    return res.status(500).json({ error });
  }
});


// Obtener producto (permiso para cualquiera, incluso no usuarios)
router.get('/find/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Obtener todos los productos (permiso para cualquiera, incluso no usuarios)
router.get('/find', async (req, res, next) => {
  const newest = req.query.new;
  const category = req.query.category;

  try {
    // Si se especifica la query new devuelve los ultimos 6 productos ordenados segun su fecha de creacion (mas nuevos primero).
    let products;
    if (newest) {
      products = await Product.find().sort({ createdAt: -1 }).limit(6)

    } else if (category) {
      // busca en el array categories si algun elemento hace match con el query category
      products = await Product.find({ categories: {
        $in: [category]
      }})
    } else {
      products = await Product.find();
    }

    res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

module.exports = router;