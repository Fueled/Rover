const contractModel = require('../models/Contract.js');
const _ = require('lodash')

/**
 * contractController.js
 *
 * @description :: Server-side logic for managing contracts.
 */

exports.getContract = (req, res) => {
	res.render('contracts/create', {
		title: 'Contract'
	});
};


exports.createContract = (req, res) => {
	var contract = new contractModel({
		name: req.body.name,
		abi: req.body.abi,
		address: req.body.address

	});

	contract.save(function (err, contract) {
		if (err) {
			return res.status(500).json({
				message: 'Error when creating contract',
				error: err
			});
		}
		return res.redirect('/contract/' + contract._id);
	});
}

exports.list = (req, res) => {
	contractModel.find(function (err, contracts) {
		if (err) {
			return res.status(500).json({
				message: 'Error when getting contract.',
				error: err
			});
		}
		return res.json(contracts);
	});
}

exports.show = (req, res) => {
	var id = req.params.id;
	contractModel.findOne({ _id: id }, function (err, contract) {
		if (err) {
			return res.status(500).json({
				message: 'Error when getting contract.',
				error: err
			});
		}
		if (!contract) {
			return res.status(404).json({
				message: 'No such contract'
			});
		}

		var abiGroup = _.groupBy(JSON.parse(contract.abi), function(pool) { return pool.type } )
		var functions = _.partition(abiGroup.function, function(abi) { return abi.constant; });
		var [events, variables, methods, init] = [abiGroup.event,functions[0], functions[1], abiGroup.constructor]

		res.render('contracts/show', {
			title: contract.name,
			contract: contract,
			events: events,
			init: init,
			variables: variables,
			methods: methods
		});
	});
}
