const { Schema, model } = require('mongoose');

const CartSchema = new Schema(
  {
    userId: {
      type: String,
      required: true
    },
    products: [
      {
        productId: { type: String },
        quantity: {
          type: Number,
          default: 1
        }
      }
    ]
  },
  { timestamps: true }
);

CartSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Cart = model('Cart', CartSchema);

module.exports = Cart;
