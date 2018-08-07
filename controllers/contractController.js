const contractModel = require('../models/Contract.js');

/**
 * contractController.js
 *
 * @description :: Server-side logic for managing contracts.
 */
module.exports = {

  /**
     * contractController.list()
     */
  list (req, res) {
        contractModel.find(function (err, contracts) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting contract.',
                    error: err
                });
            }
            return res.json(contracts);
        });
    },

  /**
     * contractController.show()
     */
  show (req, res) {
        var id = req.params.id;
        contractModel.findOne({_id: id}, function (err, contract) {
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
            return res.json(contract);
        });
    },

  /**
     * contractController.create()
     */
  create (req, res) {
        var contract = new contractModel({
			name : req.body.name,
			abi : req.body.abi,
			address : req.body.address

        });

        contract.save(function (err, contract) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating contract',
                    error: err
                });
            }
            return res.status(201).json(contract);
        });
    }
};
