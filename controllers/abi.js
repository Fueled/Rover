const AbiModel = require("../models/Abi.js");
const ContractModel = require("../models/Contract.js");

/**
 * AbiController.js
 *
 * @description :: Server-side logic for managing Abis.
 */
module.exports = {
    getContract: (req, res) => {
        const unknownUser = !req.user;
        res.render("abis/contract", {
            title: "New Contract",
            unknownUser
        });
    },

    getAbi: (req, res) => {
        const unknownUser = !req.user;
        res.render("abis/create", {
            title: "New ABI",
            projectId: req.params.id,
            unknownUser
        });
    },

    /**
     * AbiController.list()
     */
    list: function (req, res) {
        AbiModel.find(function (err, Abis) {
            if (err) {
                return res.status(500).json({
                    message: "Error when getting Abi.",
                    error: err
                });
            }
            return res.json(Abis);
        });
    },

    /**
     * AbiController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        AbiModel.findOne({_id: id}, function (err, Abi) {
            if (err) {
                return res.status(500).json({
                    message: "Error when getting Abi.",
                    error: err
                });
            }
            if (!Abi) {
                return res.status(404).json({
                    message: "No such Abi"
                });
            }
            return res.json(Abi);
        });
    },

    /**
     * AbiController.create()
     */
    create: function (req, res) {
        var Abi = new AbiModel({
            name: req.body.name,
            project: req.body.project,
            abi: req.body.abi
        });

        Abi.save(function (err, Abi) {
            if (err) {
                return res.status(500).json({
                    message: "Error when creating Abi",
                    error: err
                });
            }
            return res.redirect("/projects/" + req.body.project);
        });
    },

    createContract: (req, res) => {
        var abiId = req.params.id;

        AbiModel.findOne({_id: abiId}, function (err, abiRecord) {
            if (err) {
                return res.status(500).json({
                    message: "Error when getting Abi.",
                    error: err
                });
            }
            if (!abiRecord) {
                return res.status(404).json({
                    message: "No such Abi"
                });
            }

            var contract = new ContractModel({
                name: abiRecord.name,
                abi: abiRecord.abi,
                address: req.body.address,
                user: req.user._id,
                network: req.body.network
            });

            contract.save(function (err, contract) {
                if (err) {
                    return res.status(500).json({
                        message: "Error when creating contract",
                        error: err
                    });
                }
                return res.redirect("/c/" + contract._id);
            });
        });
    },

    /**
     * AbiController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        AbiModel.findOne({_id: id}, function (err, Abi) {
            if (err) {
                return res.status(500).json({
                    message: "Error when getting Abi",
                    error: err
                });
            }
            if (!Abi) {
                return res.status(404).json({
                    message: "No such Abi"
                });
            }

            Abi.name = req.body.name ? req.body.name : Abi.name;
            Abi.project = req.body.project ? req.body.project : Abi.project;

            Abi.save(function (err, Abi) {
                if (err) {
                    return res.status(500).json({
                        message: "Error when updating Abi.",
                        error: err
                    });
                }

                return res.json(Abi);
            });
        });
    },

    /**
     * AbiController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        AbiModel.findByIdAndRemove(id, function (err, Abi) {
            if (err) {
                return res.status(500).json({
                    message: "Error when deleting the Abi.",
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
