import { Product } from "./Product";

const { Schema, model, models } = require("mongoose");

const WishedProductSchema = new Schema({
  userEmail: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, ref: Product },
});

export const WishedProduct =
  models?.WishedProduct || model("WishedProduct", WishedProductSchema);
