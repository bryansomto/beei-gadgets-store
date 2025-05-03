const { Schema, model, models } = require("mongoose");

const OrderSchema = new Schema({
  userEmail: { type: String, required: true },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String,
      quantity: Number,
    },
  ],
  total: Number,
  address: {
    name: String,
    email: String,
    city: String,
    postalCode: String,
    streetAddress: String,
    country: String,
  },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const Order = models?.Order || model("Order", OrderSchema);
