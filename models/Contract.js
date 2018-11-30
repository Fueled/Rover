import mongoose from "mongoose";

const Schema = mongoose.Schema;

const contractSchema = new Schema({
    'name': String,
    'abi': String,
    'address': String,
    'user': {type: Schema.Types.ObjectId, ref: 'User'},
    'network': String
}, {timestamps: true});


module.exports = mongoose.model('Contract', contractSchema);
