const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY: secret } = process.env;

/**
 * Si la request tiene un token, verificarlo y si es valido, agregar el objeto user a la request y continuar al * proximo middleware.
 * @param req - request.
 * @param res - response.
 * @param next - Funcion que se llama cuando se desea pasar el control a la siguiente función de middleware en * la pila.
 * @returns token (req.user).
 */

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // 0: Bearer, 1: token
    jwt.verify(token, secret, (error, data) => {
      if (error)
        return res
          .status(403)
          .json({ error: 'El token es invalido o ya expiró' });
      req.user = data;
      next();
    });
  } else {
    return res
      .status(401)
      .json({ error: 'Debes autenticarte para realizar esta accion' });
  }
};

/**
 * Verifica el token y comprueba si el usuario es el dueño de la cuenta o si es administrador.
 * @param req - request.
 * @param res - response.
 * @param next - next middleware.
 * Si se verifica correctamente se llama al siguiente middleware.
 */

const verifyTokenAndAuth = (req, res, next) => {
  const { id } = req.params;

  verifyToken(req, res, () => {
    if (req.user.id === id || req.user.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({
          error: 'No posees los permisos necesarios para realizar esta acción',
          causes: 'El id ingresado no existe o no es el que le corresponde a tu usuario y / o no tienes permisos de administrador'
        });
    }
  });
};

/**
 * Verifica si el usuario sea administrador y posea un token valido.
 * @param req - request.
 * @param res - response.
 * @param next - next middleware.
 * Si se verifica correctamente se llama al siguiente middleware.
 */

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({ error: 'Debes ser administrador para realizar esta acción' });
    }
  });
};

module.exports = { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin };
