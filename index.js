// Habilita las variables de entorno del archivo .env.
require('dotenv').config();
// Inicia la DB y sus configuraciones.
require('./database/dbConfig');
// Evita el uso de try-catch en peticiones async.
//require('express-async-errors');
const express = require('express');
const cors = require('cors');
const productRoute = require('./routes/products');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const cartRoute = require('./routes/cart');
const orderRoute = require('./routes/order');
const paymentRoute = require('./routes/stripe');

// Crea una instancia de aplicacion con express.
const app = express();

app.use(cors());

// Middleware que parsea el body de la request y habilita la propiedad req.body.
app.use(express.json());

// Rutas.
app.get('/', (req, res) => {
  res.json({ message: 'ENTRY POINT' });
});

app.use('/api/products', productRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/cart', cartRoute);
app.use('/api/order', orderRoute);
app.use('/api/checkout', paymentRoute);

// Inicializa el servidor en el puerto especificado.
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
