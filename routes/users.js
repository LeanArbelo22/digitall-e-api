const router = require('express').Router();
const User = require('../database/models/User');
const {
  verifyTokenAndAuth,
  verifyTokenAndAdmin
} = require('../middlewares/verifyToken');
const CryptoJS = require('crypto-js');
const { DECODE_PHRASE: phrase } = process.env;

// Actualizar / modificar informacion de usuario.
router.put('/:id', verifyTokenAndAuth, async (req, res, next) => {
  let { body } = req;
  let { password } = body;
  const { id } = req.params;

  if (password) {
    password = CryptoJS.AES.encrypt(password, phrase).toString();
  }

  /* const modifiedInputs = { username, password, email, isAdmin } */

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: body // modifiedInputs
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Eliminar usuario.
router.delete('/:id', verifyTokenAndAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Obtener informacion de usuario por id (solo permitido para administrador).
// todo - Revisar que al hacer update de isAdmin el token de req.user no se modifica pero deberia
// ? - Me parece mas acorde que el usuario dueño de su cuenta pueda acceder a su informacion
router.get('/find/:id', verifyTokenAndAdmin, async (req, res, next) => {
  const { id } = req.params;

  /* 
  * PARA VER DESPUES 
  if (id !== req.user.id && !req.user.isAdmin)
    return res
      .status(400)
      .json({ error: 'Solo puedes acceder a los datos de tu cuenta' });
  */

  try {
    const user = await User.findById(id);
    res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Obtener todos los usuarios o especificados segun query strings (solo permitido para administrador).
router.get('/find', verifyTokenAndAdmin, async (req, res, next) => {
  // Ejemplo de query: http://localhost:3003/api/users/find?new=true
  const newest = req.query.new;

  try {
    // Si se especifica la query new devuelve los ultimos 5 usuarios registrados ordenados segun su id, si no se especifica, devuelve todos los usuarios.
    const user = newest
      ? await User.find().sort({ id: -1 }).limit(5)
      : await User.find();

    res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Obtener las estadisticas de los registros de usuarios en el ultimo año (solo administradores).
router.get('/stats', verifyTokenAndAdmin, async (req, res, next) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    // Las operaciones de agregación son expresiones que pueden usarse para producir resultados reducidos y resumidos.
    const data = await User.aggregate([
      // $match a la condicion: createdAt $greaterThan (mayor a) el ultimo año
      {
        $match: {
          createdAt: {
            $gte: lastYear
          }
        }
      },
      // $project pasa los documentos con los campos solicitados a la siguiente etapa de trabajo
      {
        $project: {
          // creamos la variable month, $month hace referencia al mes dentro de la fecha de createdAt
          month: { $month: '$createdAt' }
        }
      },
      // agrupa los resultados obtenidos de match ~ project
      {
        $group: {
          // _id sera igual a la variable month (que contiene el numero de mes de la fecha)
          _id: '$month',
          // total sera el resultado de la suma de todos los usuarios que matchean con el mes de createdAt
          // $sum: 1 = sumar 1 por cada match
          total: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

module.exports = router;
