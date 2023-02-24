const router = require('express').Router();
const Order = require('../database/models/Order');
const {
  verifyTokenAndAdmin,
  verifyTokenAndAuth,
  verifyToken
} = require('../middlewares/verifyToken');

// Nueva orden (cualquier usuario puede crearlo)
router.post('/', verifyToken, async (req, res, next) => {
  const newCart = new Order(req.body);

  try {
    const savedOrder = await newCart.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Modificar orden del usuario (solo admin)
router.put('/:id', verifyTokenAndAdmin, async (req, res, next) => {
  let { body } = req;
  const { id } = req.params;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: body
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Eliminar orden del usuario (solo admin)
router.delete('/:id', verifyTokenAndAdmin, async (req, res, next) => {
  const { id } = req.params;

  try {
    await Order.findByIdAndDelete(id);

    res.status(200).json({ message: 'Carrito de compras eliminado' });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Obtener orden del usuario (usuario al que le pertenece o admin) -- param id del usuario (no de order)
router.get('/find/:id', verifyTokenAndAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Los usuarios pueden tener mas de una orden
    const orders = await Order.findOne({ userId: id });
    res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Obtener todas las ordenes de todos los usuarios (solo admin)
router.get('/', verifyTokenAndAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Estadisticas: (solo admins)
// * Ingresos mensuales (comparando dos ultimos meses)
router.get('/income', verifyTokenAndAdmin, async (req, res, next) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: { createdAt: { $gte: previousMonth } } // a partir de los dos meses anterios
      },
      {
        $project: {
          month: { $month: '$createdAt' }, // obtener mes de la fecha de creacion
          sales: '$amount' // obtener valor total de cada orden
        }
      },
      {
        // agrupar por mes la suma total de todas las ventas
        $group: {
          _id: '$month',
          total: { $sum: '$sales' }
        }
      }
    ]);

    res.status(200).json({ income })
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
