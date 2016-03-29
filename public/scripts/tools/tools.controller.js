(function() {
	
	'use strict';
	
	angular
		.module('app.tools')
		.controller('ToolsController', ToolsController)
		.controller('ToolsShowController', ToolsShowController)
		.controller('ToolsCreateController', ToolsCreateController)
		.controller('ToolsEditController', ToolsEditController);
	
	ToolsController.$inject = ['$scope', 'Tools', 'tools', '$rootScope', 'Users'];
	
	function ToolsController($scope, Tools, tools, $rootScope, Users) {
		
		var tlc = this;
		
		tlc.inizialize = inizialize;
		
		tlc.inizialize();
		
		return tlc;
		
		function inizialize() {
      
      $scope.currentUser = $rootScope.currentUser;
		
			tools.$promise.then(function(res) {
        $scope.tools = res;
        
        $scope.tools.forEach(function(tool) {
          Users.getCached({
            id: tool.author
          }).$promise.then(function(res) {
            tool.author = res;
          });
        }, this);
      });
		}
	}

	ToolsShowController.$inject = ['$scope', 'Tools', 'tool', 'Users', '$rootScope'];

	function ToolsShowController($scope, Tools, tool, Users, $rootScope){

		var tlc = this;

		tlc.inizialize = inizialize;
    tlc.addComment = addComment;
    tlc.addPreference = addPreference;
    tlc.getCommentsAuthor = getCommentsAuthor;
		tlc.inizialize();

		return tlc;

		function inizialize() {
			
			$scope.selectedTags = [];

			tool.$promise.then(function(res) {
        $scope.tool = res;
        $scope.like = 0;
        $scope.dontLike = 0;
        $scope.disabledLike = false;
        $scope.disabledDontLike = false;
        $scope.tool.preferences.forEach(function(preference) {
          if(preference.type) {
            $scope.like++;
          }
          else if(!preference.type) {
            $scope.dontLike++;
          }
          if (preference.author == $rootScope.currentUser._id) {
            $scope.currentPreference = preference;
            if(preference.type) {
              $scope.disabledLike = true;
            }
            else {
              $scope.disabledDontLike = true;
            }
          }
        }, this);
        
        getCommentsAuthor();
        
        Users.getCached({
          id: $scope.tool.author
        }).$promise.then(function(res) {
          $scope.author = res;
        });
        
        $scope.tool.tags.forEach(function(tag) {
	        $scope.selectedTags.push({
		        title : tag
	        });
        });
        
      });
		}
    
    function getCommentsAuthor() {
        $scope.tool.comments.forEach(function(comment) {
          Users.getCached({
            id: comment.author
          }).$promise.then(function(res) {
            comment.authorName = res.name;
            comment.authorLastName = res.lastName;
          });
        }, this);
      }
    
    function addComment() {
      
      var comment = {};
      comment.author = $rootScope.currentUser._id;
      comment.text = $scope.comment;
      tool.comments.push(comment);
      
      $scope.tool.$update({
        id: tool._id
      }).then(function(res) {
        console.log("Commento inserito");
        $scope.tool = res;
        getCommentsAuthor();
        $scope.comment = "";
      });
    }
    
    function addPreference(type) {
      
      if($scope.currentPreference && $scope.currentPreference.type != type) {
        if($scope.currentPreference.type) {
          $scope.like--;
          $scope.dontLike++;
          $scope.disabledDontLike = !$scope.disabledDontLike;
          $scope.disabledLike = false;
        }
        else {
          $scope.dontLike--;
          $scope.like++;
          $scope.disabledLike = !$scope.disabledLike;
          $scope.disabledDontLike = false;
        }
        
        var index = $scope.tool.preferences.indexOf($scope.currentPreference);
        $scope.tool.preferences.splice(index, 1);
        
        var preference = {};
        preference.author = $rootScope.currentUser._id;
        preference.type = type;
        
        $scope.tool.preferences.push(preference);
        $scope.tool.$update({
          id: tool._id
        }).then(function() {
          console.log("Preferenza inserita");
          $scope.currentPreference = preference;          
        });
      }
      
      else if(!$scope.currentPreference) {
        console.log("ELSE IF");        
        var preference = {};
        preference.author = $rootScope.currentUser._id;
        preference.type = type;
        
        $scope.tool.preferences.push(preference);
        $scope.tool.$update({
          id: tool._id
        }).then(function() {
          console.log("Preferenza inserita");
          $scope.currentPreference = preference;
        });
        
        if(preference.type) {
          $scope.like++;
          $scope.disabledLike = !$scope.disabledLike;
          $scope.disabledDontLike = false;
        }
        else if(!preference.type) {
          $scope.dontLike++;
          $scope.disabledDontLike = !$scope.disabledDontLike;
          $scope.disabledLike = false;
        }
      }      
    }
	}

	ToolsCreateController.$inject = ['$scope', 'Tools', 'tags', '$rootScope', '$state', 'FileUploader', 'API_URL'];

	function ToolsCreateController($scope, Tools, tags, $rootScope, $state, FileUploader, API_URL) {
		
		var tlc = this;
		
		tlc.inizialize      = inizialize;
    tlc.setChoice     	= setChoice;
    tlc.transformChip 	= transformChip;
		tlc.searchTags      = searchTags;
		tlc.addTag          = addTag;
		tlc.removeTag       = removeTag;
		tlc.save            = save;
		
		tlc.inizialize();
		
		return tlc;
		
		function inizialize() {
			
			$scope.tool             = new Tools();
      $scope.tool.author    	= $rootScope.currentUser._id;
      $scope.tool.documents 	= [];
      $scope.tool.tags      	= [];
			$scope.selectedTags     = [];
			
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
        $scope.tool.documents.push({
          documentUrl : response.url
        });
      };
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
      };
      uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
        var i = $scope.tool.documents.indexOf({documentUrl : response.url});
        $scope.tool.documents.splice(i, 1);
      };
      uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
      };
      uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
        tlc.save();
      };

      console.info('uploader', uploader);
		
		}
		
    function setChoice(index) {
      $scope.choice = index;
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
		    if($scope.tool.tags.indexOf(tag.title) == -1) {
			    $scope.tool.tags.push(tag.title);
				}
				$scope.selectedItemTag = null;
	    }
	    
    }
    
    function removeTag(tag) {
	    
	    var index = $scope.tool.tags.indexOf(tag.title);
	    $scope.tool.tags.splice(index, 1);
	    
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
		
		function save() {
			console.log("save");
      if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
        $scope.tool.valid = true;
      }
			$scope.tool.$save(
				null,
				success,
				error
			);
						
		}
		
		function success(res) {
			console.log("OK");
      $state.go('app.tools');
      $rootScope.showSimpleToast("Strumento creato!");
		}
		
		function error() {
			console.log("ERROR");
		}
		
	}
	
	ToolsEditController.$inject = ['$scope', 'Tools', 'tool', 'tags', '$state', '$rootScope', 'FileUploader', 'API_URL', '$q'];
	
	function ToolsEditController($scope, Tools, tool, tags, $state, $rootScope, FileUploader, API_URL, $q) {
		
		var tlc = this;
		
		tlc.inizialize         = inizialize;
		tlc.transformChip      = transformChip;
		tlc.searchTags         = searchTags;
		tlc.addTag             = addTag;
		tlc.removeTag          = removeTag;
    tlc.save             	 = save;
    tlc.remove           	 = remove;
    tlc.eliminaDocumento 	 = eliminaDocumento;
		
		tlc.inizialize();
		
		return tlc;
		
		function inizialize() {
			
			$scope.tagMod = false;
			$scope.selectedTags = [];
			var promises        = [];
			
			promises.push(tags.$promise.then(function(res) {
				$scope.tags = res;
			}));
			
			promises.push(tool.$promise.then(function(res) {
        $scope.tool = res;
        $scope.newTool = new Tools();
        $scope.newTool.title = $scope.tool.title;
        $scope.newTool.author = $scope.tool.author;
        $scope.newTool.text = $scope.tool.text;
        $scope.newTool.documents = $scope.tool.documents;
        $scope.newTool.commments = $scope.tool.comments;
        $scope.newTool.preferences = $scope.tool.preferences;
        $scope.newTool.description = $scope.tool.description;
        $scope.newTool.tags = [];
        angular.copy($scope.tool.tags, $scope.newTool.tags);
        $scope.newTool.version = $scope.tool.versione += 1;
        $scope.newTool.father = $scope.tool._id;
        
      }));
      
      $q.all(promises).then(function() {
        
        $scope.tool.tags.forEach(function(tag) {
	        $scope.selectedTags.push({
		        title : tag
	        });
        });
        
      });
        
        $scope.urls = [];
          
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
          $scope.urls.push({
            documentUrl : response.url
          });
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
          console.info('onCancelItem', fileItem, response, status, headers);
          var i = $scope.urls.indexOf(fileItem);
          $scope.urls.splice(i, 1);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
          console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
          console.info('onCompleteAll');
          $scope.newTool.documents = $scope.urls;
        };
        console.info('uploader', uploader);
        
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
		    if($scope.newTool.tags.indexOf(tag.title) == -1) {
			    $scope.newTool.tags.push(tag.title);
				}
				$scope.selectedItemTag = null;
	    }
	    
    }
    
    function removeTag(tag) {
	    
	    $scope.tagMod = true;
	    var index = $scope.newTool.tags.indexOf(tag.title);
	    $scope.newTool.tags.splice(index, 1);
	    
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
        
    function save() {
      console.log("Save new tool");
      if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
        $scope.newTool.valid = true;
      }
      $scope.newTool.documents = $scope.urls;
      $scope.newTool.$save(
        null,
        successUpdate,
        errorSave
      );
      
		}
    
    function eliminaDocumento(doc) {
      var i = $scope.newTool.documents.indexOf(doc);
      $scope.newTool.documents.splice(i, 1);
    }
		
		// function successSave(res) {
		// 	console.log("OK");
    //   $scope.newTool = res;
    //   $scope.tool.$update(
    //     {
    //       id: $scope.tool._id
    //     },
    //     successUpdate,
    //     errorUpdate
    //   );
		// }
    
    function remove() {
      $scope.tool.$delete({
        id: $scope.tool._id
      },
      successDelete,
      errorDelete);
    }
		
		function errorSave() {
			console.log("ERROR");
		}
    function successUpdate(res) {
      console.log("OK UPDATE");
      $state.go('app.tools');
      $rootScope.showSimpleToast("Strumento modificato!");
    }
    function errorUpdate() {
      console.log("ERROR UPDATE");
    }
    function successDelete() {
      console.log("DELETE");
      $state.go('app.tools');
      $rootScope.showSimpleToast("Strumento eliminato!");
    }
    function errorDelete() {
      console.log("DELETE ERROR");
    }
	}
})();