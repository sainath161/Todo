const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema(
  {
    todo: { type: String, required: true },
    username: { type: String, required: true },
    //   time: { type: Date, required: true },
  },
  { timestamps: true }
);

// const todoObj = new todoSchema({
//   todo: "Buy groceries",
//   username: "heyyy",
//   time: Date.now(),
// });

module.exports = mongoose.model("todo", todoSchema);
