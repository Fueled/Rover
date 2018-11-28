var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
	name: String,
	secret: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

module.exports = mongoose.model("Project", ProjectSchema);
