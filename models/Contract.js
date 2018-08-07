var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var contractSchema = new Schema({
	'name' : String,
	'abi' : String,
	'address' : String
});

module.exports = mongoose.model('contract', contractSchema);
