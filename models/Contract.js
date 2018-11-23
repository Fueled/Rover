var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contractSchema = new Schema({
    'name': String,
    'abi': String,
    'address': String,
    'user': {type: Schema.Types.ObjectId, ref: 'User'},
    'network': String
}, {timestamps: true});


module.exports = mongoose.model('Contract', contractSchema);
