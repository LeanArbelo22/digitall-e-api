const router = require('express').Router();
const { STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);

router.post('/payment', (req, res, next) => {
  // esto se comunicara con react
  stripe.charges.create(
    {
      source: req.body.tokenId, // devuelto por el cliente (por la libreria react-stripe)
      amount: req.body.amount,
      currency: 'ars',
      description: 'Pago de prueba'
    },
    (error, response) => {
      if (error) return res.status(500).json({ error });
      res.status(200).json(response);
    }
  );
});

module.exports = router;
