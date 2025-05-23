const { Schema, model, models, default: mongoose } = require("mongoose");

const CategorySchema = new Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Types.ObjectId, ref: "Category", default: null },
  properties: [{ type: Object }],
});

const Category = models?.Category || model("Category", CategorySchema);

export default Category;
