const { Schema, model } = require('mongoose');

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    color: {
      type: String,
    },
    img: {
      type: String,
      required: true
    },
    categories: {
      type: Array
    },
    discount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

ProductSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Product = model('Product', ProductSchema);

module.exports = Product;
