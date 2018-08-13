const contractModel = require('../models/Contract.js');
const _ = require('lodash')
const Web3 = require('web3');
var api = require('etherscan-api').init(process.env.ETHERSCAN_API_KEY,'rinkeby', '3000')

/**
 * contractController.js
 *
 * @description :: Server-side logic for managing contracts.
 */

exports.getContract = (req, res) => {
	const unknownUser = !(req.user);
	res.render('contracts/create', {
		title: 'Contract',
		unknownUser
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
	contractModel.find({ user: req.user._id }, function (err, contracts) {
		if (err) {
			return res.status(500).json({
				message: 'Error when getting contract.',
				error: err
			});
		}
		return res.json(contracts);

		// return res.render('contracts/list', {
		// 	title: 'Contracts',
		// 	contracts: contracts,

		// });
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

		return res.render('contracts/show', {
			title: contract.name,
			contract: contract,
			events: events,
			init: init,
			variables: variables,
			methods: methods
		});
	});
}

exports.showTransactions = (req, res) => {
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

		var txlist = api.account.txlist(contract.address);
		txlist.then(function(response){
			// res.json(response)
			return res.render('contracts/transactions', {
				title: 'Transactions',
				contract: contract,
				transactions: response.result
			});
		});
	});
}

exports.showEvents = (req, res) => {
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

		let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/"));
		let currentContract = new web3.eth.Contract(JSON.parse(contract.abi), contract.address);

		currentContract.getPastEvents('allEvents', {
			fromBlock: 0,
			toBlock: 'latest'
		}, function (error, events) {
			return res.render('contracts/events', {
				title: 'Events',
				contract: contract,
				events: events
			});
		})
	});
}
