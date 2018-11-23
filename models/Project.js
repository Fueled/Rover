var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
    name: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

module.exports = mongoose.model("Project", ProjectSchema);
