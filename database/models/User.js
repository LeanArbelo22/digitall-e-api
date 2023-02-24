const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  // createdAt y updatedAt
  { timestamps: true }
);

// Método que nos permite modificar el objeto que se devuelve cuando hacemos una petición a la API. En este caso, estamos eliminando los campos _id (reemplazandolo por id), __v y contraseña.
UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  }
});

const User = model('User', UserSchema);

module.exports = User;
