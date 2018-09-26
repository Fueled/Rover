var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AbiSchema = new Schema({
  name: String,
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project"
  }
});

module.exports = mongoose.model("Abi", AbiSchema);
