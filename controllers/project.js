var ProjectModel = require('../models/Project.js');

/**
 * ProjectController.js
 *
 * @description :: Server-side logic for managing Projects.
 */
module.exports = {

    /**
     * ProjectController.list()
     */
    list: function (req, res) {
        ProjectModel.find(function (err, Projects) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Project.',
                    error: err
                });
            }
            return res.json(Projects);
        });
    },

    /**
     * ProjectController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        ProjectModel.findOne({_id: id}, function (err, Project) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Project.',
                    error: err
                });
            }
            if (!Project) {
                return res.status(404).json({
                    message: 'No such Project'
                });
            }
            return res.json(Project);
        });
    },

    /**
     * ProjectController.create()
     */
    create: function (req, res) {
        var Project = new ProjectModel({
			name : req.body.name,
			user : req.body.user

        });

        Project.save(function (err, Project) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Project',
                    error: err
                });
            }
            return res.status(201).json(Project);
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
                    message: 'Error when getting Project',
                    error: err
                });
            }
            if (!Project) {
                return res.status(404).json({
                    message: 'No such Project'
                });
            }

            Project.name = req.body.name ? req.body.name : Project.name;
			Project.user = req.body.user ? req.body.user : Project.user;
			
            Project.save(function (err, Project) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Project.',
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
                    message: 'Error when deleting the Project.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
