var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AbiSchema = new Schema({
    name: String,
    abi: String,
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project"
    }
}, {timestamps: true});

module.exports = mongoose.model("Abi", AbiSchema);
