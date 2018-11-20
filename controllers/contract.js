const contractModel = require("../models/Contract.js");
const _ = require("lodash");
const Web3 = require("web3");
const api = require("etherscan-api").init(process.env.ETHERSCAN_API_KEY,
  "rinkeby",
  "3000");
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY));
const abiDecoder = require("abi-decoder");

/**
 * contractController.js
 *
 * @description :: Server-side logic for managing contracts.
 */

exports.getContract = (req, res) => {
  const unknownUser = !req.user;
  res.render("contracts/create", {
    title: "Contract",
    unknownUser
  });
};

exports.createContract = (req, res) => {
  var contract = new contractModel({
    name: req.body.name,
    abi: req.body.abi,
    address: req.body.address,
    user: req.user._id,
    network: req.body.network
  });

  contract.save(function(err, contract) {
    if (err) {
      return res.status(500).json({
        message: "Error when creating contract",
        error: err
      });
    }
    return res.redirect("/c/" + contract._id);
  });
};

exports.list = (req, res) => {
  contractModel.find({ user: req.user._id }, function(err, contracts) {
    if (err) {
      return res.status(500).json({
        message: "Error when getting contract.",
        error: err
      });
    }
    return res.render("contracts/list", {
      title: "My Contracts",
      contracts: contracts
    });
  });
};

exports.show = (req, res) => {
  var id = req.params.id;
  contractModel.findOne({ _id: id }, function(err, contract) {
    if (err) {
      return res.status(500).json({
        message: "Error when getting contract.",
        error: err
      });
    }
    if (!contract) {
      return res.status(404).json({
        message: "No such contract"
      });
    }

    var abiGroup = _.groupBy(JSON.parse(contract.abi), function(pool) {
      return pool.type;
    });
    var functions = _.partition(abiGroup.function, function(abi) {
      return abi.constant;
    });
    var [events, variables, methods, init] = [
      _.sortBy(abiGroup.event, [
        function(o) {
          return o.name;
        }
      ]),
      _.sortBy(functions[0], [
        function(o) {
          return o.name;
        }
      ]),
      _.sortBy(functions[1], [
        function(o) {
          return o.name;
        }
      ]),
      _.sortBy(abiGroup.constructor, [
        function(o) {
          return o.name;
        }
      ])
    ];

    return res.render("contracts/show", {
      title: contract.name,
      contract: contract,
      events: events,
      init: init,
      variables: variables,
      methods: methods
    });
  });
};

exports.showTransactions = (req, res) => {
  var id = req.params.id;

  contractModel.findOne({ _id: id }, function(err, contract) {
    if (err) {
      return res.status(500).json({
        message: "Error when getting contract.",
        error: err
      });
    }
    if (!contract) {
      return res.status(404).json({
        message: "No such contract"
      });
    }

    var txlist = api.account.txlist(contract.address);
    txlist.then(function(response) {
      return res.render("transactions/transactions", {
        title: "Transactions",
        contract: contract,
        transactions: _.reverse(response.result)
      });
    });
  });
};

exports.showTransaction = (req, res) => {
  var id = req.params.id;
  var hash = req.params.hash;

  contractModel.findOne({ _id: id }, function(err, contract) {
    if (err) {
      return res.status(500).json({
        message: "Error when getting contract.",
        error: err
      });
    }
    if (!contract) {
      return res.status(404).json({
        message: "No such contract"
      });
    }

    let abi = JSON.parse(contract.abi);
    let currentContract = new web3.eth.Contract(abi, contract.address);
    abiDecoder.addABI(JSON.parse(contract.abi));

    web3.eth.getTransaction(hash).then(transactionResult => {
      Promise.all([
        web3.eth.getBlock(transactionResult.blockNumber),
        web3.eth.getTransactionReceipt(hash)
      ]).then(function(result) {
        return res.render("transactions/transaction", {
          decodedInput: abiDecoder.decodeMethod(transactionResult.input),
          transaction: transactionResult,
          transactionBlock: result[0],
          transactionReceipt: result[1],
          events: abiDecoder.decodeLogs(result[1].logs)
        });
      });
    });
  });
};

exports.showEvents = (req, res) => {
  var id = req.params.id;

  contractModel.findOne({ _id: id }, function(err, contract) {
    if (err) {
      return res.status(500).json({
        message: "Error when getting contract.",
        error: err
      });
    }
    if (!contract) {
      return res.status(404).json({
        message: "No such contract"
      });
    }

    let currentContract = new web3.eth.Contract(JSON.parse(contract.abi),
      contract.address);

      var abiGroup = _.groupBy(JSON.parse(contract.abi), function(pool) {
        return pool.type;
      });
      
      var [eventsAbi] = [
        _.sortBy(abiGroup.event, [
          function(o) {
            return o.name;
          }
        ])
      ];

    currentContract.getPastEvents("allEvents",
      {
        fromBlock: 0,
        toBlock: "latest"
      },
      function(error, events) {
        return res.render("contracts/events", {
          title: "Events",
          eventsAbi: eventsAbi,
          contract: contract,
          events: _.reverse(events)
        });
      });
  });
};
