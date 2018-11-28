import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AbiSchema = new Schema({
    name: String,
    abi: String,
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project"
    }
}, {timestamps: true});

module.exports = mongoose.model("Abi", AbiSchema);
