var ProjectModel = require("../models/Project.js");
var AbiModel = require("../models/Abi.js");

/**
 * ProjectController.js
 *
 * @description :: Server-side logic for managing Projects.
 */
module.exports = {
    getProject: (req, res) => {
        const unknownUser = !req.user;
        res.render("projects/create", {
            title: "New Project",
            unknownUser
        });
    },

    /**
     * ProjectController.list()
     */
    list: function (req, res) {
        ProjectModel.find({user: req.user._id}, function (err, projects) {
            if (err) {
                return res.status(500).json({
                    message: "Error when getting Project.",
                    error: err
                });
            }

            return res.render("projects/list", {
                title: "My Projects",
                projects: projects
            });
        });
    },

    /**
     * ProjectController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        ProjectModel.findOne({_id: id}, function (err, project) {
            if (err) {
                return res.status(500).json({
                    message: "Error when getting Project.",
                    error: err
                });
            }
            if (!project) {
                return res.status(404).json({
                    message: "No such Project"
                });
            }

            AbiModel.find({project: id}, function (err, abis) {
                if (err) {
                    return res.status(500).json({
                        message: "Error when getting Abi.",
                        error: err
                    });
                }
                return res.render("projects/show", {
                    project: project,
                    abis: abis
                });
            });
        });
    },

    /**
     * ProjectController.create()
     */
    create: function (req, res) {
        var Project = new ProjectModel({
            name: req.body.name,
            user: req.body.user
        });

        Project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    message: "Error when creating project",
                    error: err
                });
            }

            return res.redirect("/projects/" + project._id);
        });
    },

    /**
     * ProjectController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        ProjectModel.findOne({_id: id}, function (err, Project) {
            if (err) {
                return res.status(500).json({
                    message: "Error when getting Project",
                    error: err
                });
            }
            if (!Project) {
                return res.status(404).json({
                    message: "No such Project"
                });
            }

            Project.name = req.body.name ? req.body.name : Project.name;
            Project.user = req.body.user ? req.body.user : Project.user;

            Project.save(function (err, Project) {
                if (err) {
                    return res.status(500).json({
                        message: "Error when updating Project.",
                        error: err
                    });
                }

                return res.json(Project);
            });
        });
    },

    /**
     * ProjectController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        ProjectModel.findByIdAndRemove(id, function (err, Project) {
            if (err) {
                return res.status(500).json({
                    message: "Error when deleting the Project.",
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
