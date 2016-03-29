(function() {
	
	'use strict';
	
	angular
		.module('app.tutorials')
		.controller('TutorialsController', TutorialsController)
		.controller('TutorialsShowController', TutorialsShowController)
		.controller('TutorialsCreateController', TutorialsCreateController)
		.controller('TutorialsEditController', TutorialsEditController);
	
	TutorialsController.$inject = ['$scope', 'Tutorials', 'tutorials', '$rootScope', 'Users'];
	
	function TutorialsController($scope, Tutorials, tutorials, $rootScope, Users) {
		
		var tlc = this;
		
		tlc.inizialize = inizialize;
		
		tlc.inizialize();
		
		return tlc;
		
		function inizialize() {
      
      $scope.currentUser = $rootScope.currentUser;
		
			tutorials.$promise.then(function(res) {
        $scope.tutorials = res;
        
        $scope.tutorials.forEach(function(tutorial) {
          Users.getCached({
            id: tutorial.author
          }).$promise.then(function(res) {
            tutorial.author = res;
          });
        }, this);
      });
		}
	}

	TutorialsShowController.$inject = ['$scope', 'Tutorials', 'tutorial', 'Users', '$rootScope'];

	function TutorialsShowController($scope, Tutorials, tutorial, Users, $rootScope){

		var tlc = this;

		tlc.inizialize = inizialize;
    tlc.addComment = addComment;
    tlc.addPreference = addPreference;
    tlc.getCommentsAuthor = getCommentsAuthor;
		tlc.inizialize();

		return tlc;

		function inizialize() {
			
			$scope.selectedTags = [];

			tutorial.$promise.then(function(res) {
        $scope.tutorial = res;
        $scope.like = 0;
        $scope.dontLike = 0;
        $scope.disabledLike = false;
        $scope.disabledDontLike = false;
        $scope.tutorial.preferences.forEach(function(preference) {
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
          id: $scope.tutorial.author
        }).$promise.then(function(res) {
          $scope.author = res;
        });
        
        $scope.tutorial.tags.forEach(function(tag) {
	        $scope.selectedTags.push({
		        title : tag
	        });
        });
        
      });
		}
    
    function getCommentsAuthor() {
        $scope.tutorial.comments.forEach(function(comment) {
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
      tutorial.comments.push(comment);
      
      $scope.tutorial.$update({
        id: tutorial._id
      }).then(function(res) {
        console.log("Commento inserito");
        $scope.tutorial = res;
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
        
        var index = $scope.tutorial.preferences.indexOf($scope.currentPreference);
        $scope.tutorial.preferences.splice(index, 1);
        
        var preference = {};
        preference.author = $rootScope.currentUser._id;
        preference.type = type;
        
        $scope.tutorial.preferences.push(preference);
        $scope.tutorial.$update({
          id: tutorial._id
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
        
        $scope.tutorial.preferences.push(preference);
        $scope.tutorial.$update({
          id: tutorial._id
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

	TutorialsCreateController.$inject = ['$scope', 'Tutorials', 'tags', '$rootScope', '$state', 'FileUploader', 'API_URL'];

	function TutorialsCreateController($scope, Tutorials, tags, $rootScope, $state, FileUploader, API_URL) {
		
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
			
			$scope.tutorial           = new Tutorials();
      $scope.tutorial.author    = $rootScope.currentUser._id;
      $scope.tutorial.documents = [];
      $scope.tutorial.tags      = [];
			$scope.selectedTags       = [];
			
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
        $scope.tutorial.documents.push({
          documentUrl : response.url
        });
      };
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
      };
      uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
        var i = $scope.tutorial.documents.indexOf({documentUrl : response.url});
        $scope.tutorial.documents.splice(i, 1);
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
		    if($scope.tutorial.tags.indexOf(tag.title) == -1) {
			    $scope.tutorial.tags.push(tag.title);
				}
				$scope.selectedItemTag = null;
	    }
	    
    }
    
    function removeTag(tag) {
	    
	    var index = $scope.tutorial.tags.indexOf(tag.title);
	    $scope.tutorial.tags.splice(index, 1);
	    
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
        $scope.tutorial.valid = true;
      }
			$scope.tutorial.$save(
				null,
				success,
				error
			);
						
		}
		
		function success(res) {
			console.log("OK");
      $state.go('app.tutorials');
      $rootScope.showSimpleToast("Tutorial creato!");
		}
		
		function error() {
			console.log("ERROR");
		}
		
	}
	
	TutorialsEditController.$inject = ['$scope', 'Tutorials', 'tutorial', 'tags', '$state', '$rootScope', 'FileUploader', 'API_URL', '$q'];
	
	function TutorialsEditController($scope, Tutorials, tutorial, tags, $state, $rootScope, FileUploader, API_URL, $q) {
		
		var tlc = this;
		
		tlc.inizialize         = inizialize;
		tlc.transformChip      = transformChip;
		tlc.searchTags         = searchTags;
		tlc.addTag             = addTag;
		tlc.removeTag          = removeTag;
    tlc.save               = save;
    tlc.remove             = remove;
    tlc.eliminaDocumento   = eliminaDocumento;
		
		tlc.inizialize();
		
		return tlc;
		
		function inizialize() {
			
			$scope.tagMod = false;
			$scope.selectedTags = [];
			var promises        = [];
			
			promises.push(tags.$promise.then(function(res) {
				$scope.tags = res;
			}));
			
			promises.push(tutorial.$promise.then(function(res) {
				
        $scope.tutorial = res;
        $scope.newTutorial = new Tutorials();
        $scope.newTutorial.title = $scope.tutorial.title;
        $scope.newTutorial.author = $scope.tutorial.author;
        $scope.newTutorial.text = $scope.tutorial.text;
        $scope.newTutorial.documents = $scope.tutorial.documents;
        $scope.newTutorial.commments = $scope.tutorial.comments;
        $scope.newTutorial.preferences = $scope.tutorial.preferences;
        $scope.newTutorial.description = $scope.tutorial.description;
        $scope.newTutorial.tags = [];
        angular.copy($scope.tutorial.tags, $scope.newTutorial.tags);
        $scope.newTutorial.version = $scope.tutorial.versione += 1;
        $scope.newTutorial.father = $scope.tutorial._id;
        
      }));
      
      $q.all(promises).then(function() {
        
        $scope.newTutorial.tags.forEach(function(tag) {
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
          $scope.newTutorial.documents = $scope.urls;
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
		    if($scope.newTutorial.tags.indexOf(tag.title) == -1) {
			    $scope.newTutorial.tags.push(tag.title);
				}
				$scope.selectedItemTag = null;
	    }
	    
    }
    
    function removeTag(tag) {
	    
	    $scope.tagMod = true;
	    var index = $scope.newTutorial.tags.indexOf(tag.title);
	    $scope.newTutorial.tags.splice(index, 1);
	    
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
      console.log("Save new tutorial");
      if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
        $scope.newTutorial.valid = true;
      }
      $scope.newTutorial.documents = $scope.urls;
      $scope.newTutorial.$save(
        null,
        successUpdate,
        errorSave
      );
      
		}
    
    function eliminaDocumento(doc) {
      var i = $scope.newTutorial.documents.indexOf(doc);
      $scope.newTutorial.documents.splice(i, 1);
    }
		
		// function successSave(res) {
		// 	console.log("OK");
    //   $scope.newTutorial = res;
    //   $scope.tutorial.$update(
    //     {
    //       id: $scope.tutorial._id
    //     },
    //     successUpdate,
    //     errorUpdate
    //   );
		// }
    
    function remove() {
      $scope.tutorial.$delete({
        id: $scope.tutorial._id
      },
      successDelete,
      errorDelete);
    }
		
		function errorSave() {
			console.log("ERROR");
		}
    function successUpdate(res) {
      console.log("OK UPDATE");
      $state.go('app.tutorials');
      $rootScope.showSimpleToast("Tutorial modificato!");
    }
    function errorUpdate() {
      console.log("ERROR UPDATE");
    }
    function successDelete() {
      console.log("DELETE");
      $state.go('app.tutorials');
      $rootScope.showSimpleToast("Tutorial eliminato!");
    }
    function errorDelete() {
      console.log("DELETE ERROR");
    }
	}
})();