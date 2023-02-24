const router = require('express').Router();
const Cart = require('../database/models/Cart');
const {
  verifyTokenAndAdmin,
  verifyTokenAndAuth,
  verifyToken
} = require('../middlewares/verifyToken');

// Nuevo carrito (cualquier usuario puede crearlo)
router.post('/', verifyToken, async (req, res, next) => {
  const newCart = new Cart(req.body);

  try {
    const savedCart = await newCart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Modificar carrito del usuario (usuario al que le pertenece o admin)
router.put('/:id', verifyTokenAndAuth, async (req, res, next) => {
  let { body } = req;
  const { id } = req.params;

  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      id,
      {
        $set: body
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Eliminar carrito del usuario (usuario al que le pertenece o admin)
router.delete('/:id', verifyTokenAndAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    await Cart.findByIdAndDelete(id);

    res.status(200).json({ message: 'Carrito de compras eliminado' });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Obtener carrito del usuario (usuario al que le pertenece o admin) -- param id del usuario (no de cart)
router.get('/find/:id', verifyTokenAndAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Los usuarios pueden tener solo un carrito
    const cart = await Cart.findOne({ userId: id });
    res.status(200).json({ cart });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Obtener todos los carritos (permiso para administradores)
router.get('/', verifyTokenAndAdmin, async (req, res, next) => {
  try {
    const carts = await Cart.find();
    res.status(200).json({ carts });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

module.exports = router;
