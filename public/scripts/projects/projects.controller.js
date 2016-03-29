(function() {
	
	'use strict';
	
	angular
		.module('app.projects')
		.controller('ProjectsController', ProjectsController)
		.controller('ProjectsShowController', ProjectsShowController)
		.controller('ProjectsCreateController', ProjectsCreateController)
		.controller('ProjectsEditController', ProjectsEditController)
    .controller('ProjectStatController', ProjectStatController);
	
	ProjectsController.$inject = ['$scope', 'Projects', 'projects'];
	
	function ProjectsController($scope, Projects, projects) {
		
		var pjc = this;
		
		pjc.inizialize = inizialize;
		
		pjc.inizialize();
		
		return pjc;
		
		function inizialize() {
		
			projects.$promise.then(function(res) {
        $scope.projects = res;
      });

		}
	
	}

	ProjectsShowController.$inject = ['$scope', 'Projects', 'Users', 'Tools', 'project', '$rootScope'];

	function ProjectsShowController($scope, Projects, Users, Tools, project, $rootScope) {

		var pjc = this;

		pjc.inizialize = inizialize;

		pjc.inizialize();

		return pjc;

		function inizialize(){

			project.$promise.then(function(res) {
				
        $scope.project = res;
        $scope.selectedTags = [];
        
        $scope.project.tags.forEach(function(tag) {
	        $scope.selectedTags.push({
		        title : tag
	        });
        });
        
        $scope.editable = false;
        
        var elementPosPm = $scope.project.projectManagers.map(function(x) {return x.userId; }).indexOf($rootScope.currentUser._id);
				if($scope.project.projectManagers[elementPosPm]){
					$scope.editable = true;
				}
				
				var elementPosTm = $scope.project.teamMembers.map(function(x) {return x.userId; }).indexOf($rootScope.currentUser._id);
				if($scope.project.projectManagers[elementPosTm]){
					$scope.editable = true;
				}
				                
        $scope.project.projectManagers.forEach(function(resPm) {
	        
	        Users.get({ id : resPm.userId}).$promise.then(function(resUser) {
	        	resPm.obj = resUser;
	        });
	        
        });
        
        $scope.project.teamMembers.forEach(function(resTm) {
	        
	        Users.get({ id : resTm.userId}).$promise.then(function(resUser) {
	        	resTm.obj = resUser;
	        });
	        
        });
        
        $scope.project.tools.forEach(function(resTl) {
	        
	        Tools.get({ id : resTl.toolId}).$promise.then(function(resTool) {
	        	resTl.obj = resTool;
	        });
	        
        });
        
      });

		}

	}

	ProjectsCreateController.$inject = ['$scope', 'Projects', 'users', 'tools', 'efforts', 'metrics', 'tags', '$rootScope', 'FileUploader', 'API_URL', '$state'];
	
	function ProjectsCreateController($scope, Projects, users, tools, efforts, metrics, tags, $rootScope, FileUploader, API_URL, $state) {
		
		var pjc = this;
		
		pjc.inizialize    = inizialize;
		pjc.transformChip = transformChip;
		pjc.searchTags    = searchTags;
		pjc.addTag	      = addTag;
		pjc.removeTag	    = removeTag;
		pjc.searchUsers   = searchUsers;
		pjc.addUser       = addUser;
		pjc.removeUser    = removeUser;
		pjc.searchTools   = searchTools;
		pjc.addTool       = addTool;
		pjc.removeTool    = removeTool;
		pjc.addEffort     = addEffort;
		pjc.removeEffort  = removeEffort;
		pjc.addMetric     = addMetric;
		pjc.removeMetric  = removeMetric;
		pjc.save          = save;
		
		pjc.inizialize();
		
		return pjc;
		
		function inizialize() {
			
			$scope.project                 = new Projects();
			$scope.project.projectManagers = [];
			$scope.project.teamMembers     = [];
			$scope.project.documents	     = [];
			$scope.project.tools           = [];
			$scope.project.efforts         = [];
			$scope.project.metrics         = [];
			$scope.project.tags		         = [];
			$scope.selectedTags		         = [];
			$scope.selected                = {};
			
			users.$promise.then(function(res) {
				$scope.users = res;
			});
			
			tools.$promise.then(function(res) {
				$scope.tools = res;
			});
			
			efforts.$promise.then(function(res) {
				$scope.efforts = res;
			});
			
			metrics.$promise.then(function(res) {
				$scope.metrics = res;
			});
			
			tags.$promise.then(function(res) {
				$scope.tags = res;
			});
			
      var uploader = $scope.uploader = new FileUploader({
        url: API_URL + 'upload',
        headers: {
          token: $rootScope.currentUser.token
        }
      });

      // FILTERS

      uploader.filters.push({
        name: 'customFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
          return this.queue.length < 10;
        }
      });

      // CALLBACKS

      uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
      };
      uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
      };
      uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
      };
      uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
      };
      uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
      };
      uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
      };
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
        $scope.project.documents.push({
	        title : $scope.documentTitle,
          documentUrl : response.url
        });
        $scope.documentTitle = '';
      };
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
      };
      uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
      };
      uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
      };
      uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
      };
		
		}
		
		function transformChip(chip) {

      if (angular.isObject(chip)) {
        return chip;
      }
      
      return { 
	      title: chip 
	    }
    }
    
    function searchTags(searchText) {
			var results = searchText ? $scope.tags.filter( createFilterForTitle(searchText) ) : $scope.tags, deferred;
			return results;
		}
		
		function addTag(tag) {
	    
	    if(tag) {
		    if($scope.project.tags.indexOf(tag.title) == -1) {
			    $scope.project.tags.push(tag.title);
				}
				$scope.selectedItemTag = null;
	    }
	    
    }
    
    function removeTag(tag) {
	    
	    var index = $scope.project.tags.indexOf(tag.title);
	    $scope.project.tags.splice(index, 1);
	    
    }
		
		function searchUsers(searchText) {
			var results = searchText ? $scope.users.filter( createFilterForUsers(searchText) ) : $scope.users, deferred;
			return results;
		}
		
		function createFilterForUsers(query) {

      var lowercaseQuery = angular.lowercase(query.replace(/ /g, ''));

      return function filterFn(state) {
	      
	      var name     = state.name.replace(/ /g, '');
	      var lastName = state.lastName.replace(/ /g, '');
	      var email    = state.email.replace(/ /g, '');
	      
				var lowercaseUser = angular.lowercase(name+lastName+email);
				
				var condition     = lowercaseUser.indexOf(lowercaseQuery) > -1;
				
        return condition;
      };

    }
    
    function addUser(user, pm) {
	    
	    if(user) {
		    
		    if(pm) {
			    if($scope.project.projectManagers.indexOf(user) == -1) {
				    $scope.project.projectManagers.push({
					    userId : user._id,
					    obj : user
					  });
					}
			    $scope.selectedItemPM = null;
		    }
		    else {
			    if($scope.project.teamMembers.indexOf(user) == -1) {
				    $scope.project.teamMembers.push({
					    userId : user._id,
					    obj : user
					  });
					}
			    $scope.selectedItemTM = null;
		    }
		    
	    }
	    
    }
    
    function removeUser(user, pm) {
	    
	    if(pm) {
		    var index = $scope.project.projectManagers.indexOf(user);
		    $scope.project.projectManagers.splice(index, 1);
	    }
	    else {
		    var index = $scope.project.teamMembers.indexOf(user);
		    $scope.project.teamMembers.splice(index, 1);
	    }
	    
    }
    
    function searchTools(searchText) {
			var results = searchText ? $scope.tools.filter( createFilterForTitle(searchText) ) : $scope.tools, deferred;
			return results;
		}
		
		function createFilterForTitle(query) {

      var lowercaseQuery = angular.lowercase(query.replace(/ /g, ''));

      return function filterFn(state) {
	      
	      var title = state.title.replace(/ /g, '');
	      
				var lowercaseTool = angular.lowercase(title);
				
				var condition     = lowercaseTool.indexOf(lowercaseQuery) > -1;
				
        return condition;
      };

    }
    
    function addTool(tool) {
	    
	    if(tool) {
		    if($scope.project.tools.indexOf(tool) == -1) {
			    $scope.project.tools.push({
				    toolId : tool._id,
				    obj : tool
			    });
				}
				$scope.selectedItemTool = null;
	    }
	    
    }
    
    function removeTool(tool) {
	    
	    var index = $scope.project.tools.indexOf(tool);
	    $scope.project.tools.splice(index, 1);
	    
    }
    		
		function addEffort(effortType, effortValue) {
			
			effortValue = effortValue || '';
			
	    if(effortType) {
		    if($scope.project.efforts.indexOf(effortType) == -1) {
			    $scope.project.efforts.push({ 
				    type : effortType,
				    value : effortValue
		    	});
				}
	    }
	    
	    $scope.newEffortType = '';
	    $scope.newEffortValue = '';
	    
    }
    
    function removeEffort(effort) {
	    
	    var index = $scope.project.efforts.indexOf(effort);
	    $scope.project.efforts.splice(index, 1);
	    
    }
    
    function addMetric(metricType, metricValue) {
			
			metricValue = metricValue || '';
			
	    if(metricType) {
		    if($scope.project.metrics.indexOf(metricType) == -1) {
			    $scope.project.metrics.push({ 
				    type : metricType,
				    value : metricValue
		    	});
				}
	    }
	    
	    $scope.newMetricType = '';
	    $scope.newMetricValue = '';
	    
    }
    
    function removeMetric(metric) {
	    
	    var index = $scope.project.metric.indexOf(metric);
	    $scope.project.metrics.splice(index, 1);
	    
    }
		
		function save() {
			console.log("save");
			console.log($scope.project);
			
			$scope.project.$save(
				null,
				success,
				error
			);
			
		}
		
		function success(res) {
			console.log("OK");
			$state.go('app.projectsShow', { id : res._id});
      $rootScope.showSimpleToast("Progetto creato!");
		}
		
		function error() {
			console.log("ERROR");
		}
		
	}

	ProjectsEditController.$inject = ['$scope', 'Projects', 'project', 'users', 'tools', 'efforts', 'metrics', 'tags', '$rootScope', 'FileUploader', 'API_URL', '$q', '$state'];
	
	function ProjectsEditController($scope, Projects, project, users, tools, efforts, metrics, tags, $rootScope, FileUploader, API_URL, $q, $state) {
		
		var pjc = this;
		
		pjc.inizialize     = inizialize;
		pjc.transformChip = transformChip;
		pjc.searchTags    = searchTags;
		pjc.addTag	      = addTag;
		pjc.removeTag	    = removeTag;
		pjc.searchUsers    = searchUsers;
		pjc.addUser        = addUser;
		pjc.removeUser     = removeUser;
		pjc.searchTools    = searchTools;
		pjc.addTool        = addTool;
		pjc.removeTool     = removeTool;
		pjc.addEffort      = addEffort;
		pjc.removeEffort   = removeEffort;
		pjc.addMetric      = addMetric;
		pjc.removeMetric   = removeMetric;
		pjc.removeDocument = removeDocument;
    pjc.remove       = remove;
    pjc.update       = update;

		pjc.inizialize();
		
		return pjc;
		
		function inizialize() {
		
			$scope.tagMod = false;
			$scope.selectedTags = [];
			$scope.selected = {};
			var promises    = [];
			
      promises.push(project.$promise.then(function(res) {
        $scope.project = res;
      }));
			
			promises.push(users.$promise.then(function(res) {
				$scope.users = res;
			}));
			
			promises.push(tools.$promise.then(function(res) {
				$scope.tools = res;
			}));
			
			efforts.$promise.then(function(res) {
				$scope.efforts = res;
			});
			
			metrics.$promise.then(function(res) {
				$scope.metrics = res;
			});
			
			tags.$promise.then(function(res) {
				$scope.tags = res;
			});
			
			$q.all(promises).then(function() {
        
        $scope.project.tags.forEach(function(tag) {
	        $scope.selectedTags.push({
		        title : tag
	        });
        });
				
				$scope.project.projectManagers.forEach(function(pm) {
					
					var elementPos = $scope.users.map(function(x) {return x._id; }).indexOf(pm.userId);
					pm.obj = $scope.users[elementPos];
										
				});
				
				$scope.project.teamMembers.forEach(function(tm) {
					
					var elementPos = $scope.users.map(function(x) {return x._id; }).indexOf(tm.userId);
					tm.obj = $scope.users[elementPos];
										
				});
				
				$scope.project.tools.forEach(function(tool) {
					
					var elementPos = $scope.tools.map(function(x) {return x._id; }).indexOf(tool.toolId);
					tool.obj = $scope.tools[elementPos];
										
				});
								
			});
			
      var uploader = $scope.uploader = new FileUploader({
        url: API_URL + 'upload',
        headers: {
          token: $rootScope.currentUser.token
        }
      });
        
      // FILTERS

      uploader.filters.push({
        name: 'customFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
          return this.queue.length < 10;
        }
      });

      // CALLBACKS

      uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
      };
      uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
      };
      uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
      };
      uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
      };
      uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
      };
      uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
      };
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
        $scope.project.documents.push({
	        title : $scope.documentTitle,
          documentUrl : response.url
        });
        $scope.documentTitle = '';
      };
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
      };
      uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
      };
      uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
      };
      uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
      };
      		
		}
		
		function transformChip(chip) {

      if (angular.isObject(chip)) {
        return chip;
      }
      
      return { 
	      title: chip 
	    }
    }
    
    function searchTags(searchText) {
			var results = searchText ? $scope.tags.filter( createFilterForTitle(searchText) ) : $scope.tags, deferred;
			return results;
		}
		
		function addTag(tag) {
	    
	    if(tag) {
		    $scope.tagMod = true;
		    if($scope.project.tags.indexOf(tag.title) == -1) {
			    $scope.project.tags.push(tag.title);
				}
				$scope.selectedItemTag = null;
	    }
	    
    }
    
    function removeTag(tag) {
	    
	    $scope.tagMod = true;
	    var index = $scope.project.tags.indexOf(tag.title);
	    $scope.project.tags.splice(index, 1);
	    
    }
		
		function searchUsers(searchText) {
			var results = searchText ? $scope.users.filter( createFilterForUsers(searchText) ) : $scope.users, deferred;
			return results;
		}
		
		function createFilterForUsers(query) {

      var lowercaseQuery = angular.lowercase(query.replace(/ /g, ''));

      return function filterFn(state) {
	      
	      var name     = state.name.replace(/ /g, '');
	      var lastName = state.lastName.replace(/ /g, '');
	      var email    = state.email.replace(/ /g, '');
	      
				var lowercaseUser = angular.lowercase(name+lastName+email);
				
				var condition     = lowercaseUser.indexOf(lowercaseQuery) > -1;
				
        return condition;
      };

    }
    
    function addUser(user, pm) {
	    
	    if(user) {
		    
		    if(pm) {
			    if($scope.project.projectManagers.indexOf(user) == -1) {
				    $scope.project.projectManagers.push({
					    userId : user._id,
					    obj : user
					  });
					}
			    $scope.selectedItemPM = null;
		    }
		    else {
			    if($scope.project.teamMembers.indexOf(user) == -1) {
				    $scope.project.teamMembers.push({
					    userId : user._id,
					    obj : user
					  });
					}
			    $scope.selectedItemTM = null;
		    }
		    
	    }
	    
	    
    }
    
    function removeUser(user, pm) {
	    
	    if(pm) {
		    var index = $scope.project.projectManagers.indexOf(user);
		    $scope.project.projectManagers.splice(index, 1);
	    }
	    else {
		    var index = $scope.project.teamMembers.indexOf(user);
		    $scope.project.teamMembers.splice(index, 1);
	    }
	    
    }
    
    function searchTools(searchText) {
			var results = searchText ? $scope.tools.filter( createFilterForTitle(searchText) ) : $scope.tools, deferred;
			return results;
		}
		
		function createFilterForTitle(query) {

      var lowercaseQuery = angular.lowercase(query.replace(/ /g, ''));

      return function filterFn(state) {
	      
	      var title = state.title.replace(/ /g, '');
	      
				var lowercaseTool = angular.lowercase(title);
				
				var condition     = lowercaseTool.indexOf(lowercaseQuery) > -1;
				
        return condition;
      };

    }
    
    function addTool(tool) {
	    
	    if(tool) {
		    if($scope.project.tools.indexOf(tool) == -1) {
			    $scope.project.tools.push({
				    toolId : tool._id,
				    obj : tool
			    });
				}
				$scope.selectedItemTool = null;
	    }
	    
    }
    
    function removeTool(tool) {
	    
	    var index = $scope.project.tools.indexOf(tool);
	    $scope.project.tools.splice(index, 1);
	    
    }
    		
		function addEffort(effortType, effortValue) {
			
			effortValue = effortValue || '';
			
	    if(effortType) {
		    if($scope.project.efforts.indexOf(effortType) == -1) {
			    $scope.project.efforts.push({ 
				    type : effortType,
				    value : effortValue
		    	});
				}
	    }
	    
	    $scope.newEffortType = '';
	    $scope.newEffortValue = '';
	    
    }
    
    function removeEffort(effort) {
	    
	    var index = $scope.project.efforts.indexOf(effort);
	    $scope.project.efforts.splice(index, 1);
	    
    }
    
    function addMetric(metricType, metricValue) {
			
			metricValue = metricValue || '';
			
	    if(metricType) {
		    if($scope.project.metrics.indexOf(metricType) == -1) {
			    $scope.project.metrics.push({ 
				    type : metricType,
				    value : metricValue
		    	});
				}
	    }
	    
	    $scope.newMetricType = '';
	    $scope.newMetricValue = '';
	    
    }
    
    function removeMetric(metric) {
	    
	    var index = $scope.project.metric.indexOf(metric);
	    $scope.project.metrics.splice(index, 1);
	    
    }
    
    function removeDocument(doc) {
      var i = $scope.project.documents.indexOf(doc);
      $scope.project.documents.splice(i, 1);
    }
    
    function remove() {
      $scope.project.$delete({
        id: $scope.project._id
      },
      successDelete,
      errorDelete);
    }
    
    function successDelete() {
      console.log("DELETE");
      $state.go('app.projects');
      $rootScope.showSimpleToast("Progetto eliminato!");
    }
    
    function errorDelete() {
      console.log("DELETE ERROR");
    }
        
	  function update() {
			console.log("update");
			console.log($scope.project);
			
			$scope.project.$update(
				{
					id : $scope.project._id
				},
				successUpdate,
				errorUpdate
			);
			
		}
		
		function successUpdate() {
			console.log("OK");
			$state.go('app.projectsShow', { id : $scope.project._id});
      $rootScope.showSimpleToast("Progetto modificato!");
		}
		
		function errorUpdate() {
			console.log("ERROR");
		}
	
	}
  
  ProjectStatController.$inject = ['$scope', 'Projects', 'Efforts', 'Metrics', '$q', 'type'];
  
  function ProjectStatController($scope, Projects, Efforts, Metrics, $q, type) {
    
    var pjs = this;
		
		pjs.inizialize = inizialize;
		
		pjs.inizialize();
		
		return pjs;
    
    function inizialize() {
      
      if(type == 0) {
        $scope.efforts = [];
        Efforts.query().$promise.then(function(efforts) {
          efforts.forEach(function(effort) {
            Projects.getByEffort({ type: effort.title }).$promise
              .then(function(projects) {
                
                
                var projectsFound = [];
                
                projects.forEach(function(project) {
                  
                  var elementPos = project.efforts.map(function(x) {return x.type; }).indexOf(effort.title);
                  var value = project.efforts[elementPos].value;
                  
                  projectsFound.push({
                    value: value,
                    projectTitle: project.title,
                    projectId: project._id
                  });
                  
                }, this);
                
                $scope.efforts.push({
                  name: effort.title,
                  projects: projectsFound
                });
                
              });
          }, this);
        });
      }
      else {
        console.log("METRIC");
        $scope.metrics = [];
        Metrics.query().$promise.then(function(metrics) {
          metrics.forEach(function(metric) {
            Projects.getByMetric({ type: metric.title }).$promise
              .then(function(projects) {
                
                
                var projectsFound = [];
                
                projects.forEach(function(project) {
                  
                  var elementPos = project.metrics.map(function(x) {return x.type; }).indexOf(metric.title);
                  var value = project.metrics[elementPos].value;
                  
                  projectsFound.push({
                    value: value,
                    projectTitle: project.title,
                    projectId: project._id
                  });
                  
                }, this);
                
                $scope.metrics.push({
                  name: metric.title,
                  projects: projectsFound
                });
                
              });
          }, this);
        });
      }
      
    }
    
  }
  
})();