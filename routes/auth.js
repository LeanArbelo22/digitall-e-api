const router = require('express').Router();
const User = require('../database/models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const { DECODE_PHRASE: phrase, JWT_SECRET_KEY: secret } = process.env;

// Registro
router.post('/register', async (req, res, next) => {
  const { username, email, password, isAdmin } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Faltan datos para completar la peticion' });
  }

  const encrypted = CryptoJS.AES.encrypt(password, phrase);
  const hash = encrypted.toString();

  const newUser = new User({
    username,
    email,
    password: hash,
    isAdmin
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  const { username, password: inputPassword } = req.body;

  if (!username || !inputPassword) {
    return res
      .status(400)
      .json({ error: 'Faltan datos para completar la peticion' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user)
      return res.status(401).json({ error: 'Usuario y/o contraseña invalido' });

    const decrypted = CryptoJS.AES.decrypt(user.password, phrase);
    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8);

    if (inputPassword !== originalPassword)
      return res.status(401).json({ error: 'Usuario y/o contraseña invalido' });

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin // !! AL MODIFICAR EL USER HAY QUE RE HACER EL TOKEN
      },
      secret,
      { expiresIn: '2d' }
    );

    const { password, ...others } = user._doc; // para no mandar la password en la peticion

    res.status(200).json({ ...others, accessToken });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;