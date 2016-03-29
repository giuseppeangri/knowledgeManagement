var express = require('express');
var restify = require('express-restify-mongoose');

var token = require('../controllers/token');

var articleModel  = require('../models/article');
var projectModel  = require('../models/project');
var templateModel = require('../models/template');
var toolModel     = require('../models/tool');
var tutorialModel = require('../models/tutorial');
var userModel     = require('../models/user');
var effortModel   = require('../models/effort');
var metricModel   = require('../models/metric');
var tagModel      = require('../models/tag');

var articleController  = require('../controllers/article');
var projectController  = require('../controllers/project');
var templateController = require('../controllers/template');
var toolController     = require('../controllers/tool');
var tutorialController = require('../controllers/tutorial');
var userController     = require('../controllers/user');
var effortController   = require('../controllers/effort');
var metricController   = require('../controllers/metric');
var tagController      = require('../controllers/tag');

module.exports = (function() {
    var api = express.Router();

    restify.serve(api, articleModel, {preMiddleware: token.verifyToken,
	    																preRead: articleController.preRead,
                                      preCreate: articleController.preCreate});
                                        
    restify.serve(api, projectModel, {preMiddleware: token.verifyToken,
                                      preCreate: projectController.preCreate,
                                      preDelete: projectController.preDelete});
                                        
    restify.serve(api, templateModel, {preMiddleware: token.verifyToken,
																		   preRead: articleController.preRead,
                                       preCreate: templateController.preCreate,
                                       preDelete: templateController.preDelete});
                                        
    restify.serve(api, toolModel, {preMiddleware: token.verifyToken,
                                   preDelete: toolController.preDelete});
                                    
    restify.serve(api, tutorialModel, {preMiddleware: token.verifyToken,
                                       preDelete: tutorialController.preDelete});
                                        
    restify.serve(api, userModel, {
															     outputFn: userController.outputFn,
															     preCreate: userController.preCreate,
                                   preUpdate: userController.preUpdate,
                                   preDelete: userController.preDelete});
                                  
    restify.serve(api, effortModel, {preMiddleware: token.verifyToken,
																     preCreate: effortController.preCreate,
                                     preUpdate: effortController.preUpdate,
                                     preDelete: effortController.preDelete});
                                    
    restify.serve(api, metricModel, {preMiddleware: token.verifyToken,
																	   preCreate: metricController.preCreate,
                                     preUpdate: metricController.preUpdate,
                                     preDelete: metricController.preDelete});
    
    restify.serve(api, tagModel, 		{preMiddleware: token.verifyToken,
																	   preCreate: tagController.preCreate,
                                     preUpdate: tagController.preUpdate,
                                     preDelete: tagController.preDelete});
    
    return api;
})();
