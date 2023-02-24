const { Schema, model } = require('mongoose');

const OrderSchema = new Schema(
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
    ],
    amount: {
      type: Number,
      required: true
    },
    address: {
      type: Object,
      required: true
    },
    status: {
      type: String,
      default: 'Pending'
    }
  },
  { timestamps: true }
);

OrderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Order = model('Order', OrderSchema);

module.exports = Order;