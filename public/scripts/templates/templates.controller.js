(function() {
	'use strict';
	
	angular
		.module('app.templates')
		.controller('TemplatesController', TemplatesController)
    .controller('TemplatesShowController', TemplatesShowController)
    .controller('TemplatesCreateController', TemplatesCreateController)
    .controller('TemplatesEditController', TemplatesEditController);
        
	
	TemplatesController.$inject = ['$scope', 'Templates', 'templates', '$rootScope', 'Users'];
	
	function TemplatesController($scope, Templates, templates, $rootScope, Users) {
		
		var tc = this;
		
		tc.inizialize = inizialize;
		
		tc.inizialize();
		
		return tc;
		
		function inizialize() {
      
      $scope.currentUser = $rootScope.currentUser;
			
      templates.$promise.then(function(res) {
        $scope.templates = res;
        
        $scope.templates.forEach(function(template) {
          Users.getCached({
            id: template.author
          }).$promise.then(function(res) {
            template.author = res;
            
          });
          
        }, this);
        
      });		
		}
	
	}
    
    TemplatesShowController.$inject = ['$scope', 'Templates', 'template', 'Users', '$rootScope'];
    
    function TemplatesShowController($scope, Templates, template, Users, $rootScope){
        
      var tc = this;
		
      tc.inizialize = inizialize;
      tc.addComment = addComment;
      tc.addPreference = addPreference;
      tc.getCommentsAuthor = getCommentsAuthor;
      tc.inizialize();
      
      return tc;
      
      function inizialize() {
	      
	      $scope.selectedTags = [];
        
        template.$promise.then(function(res) {
          
          $scope.template = res;
          
          $scope.like = 0;
          $scope.dontLike = 0;
          $scope.disabledLike = false;
          $scope.disabledDontLike = false;
          $scope.template.preferences.forEach(function(preference) {
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
            id: $scope.template.author
          }).$promise.then(function(res) {
            $scope.author = res;
          });
					
					$scope.template.tags.forEach(function(tag) {
		        $scope.selectedTags.push({
			        title : tag
		        });
	        });

        });
      }
      
      function getCommentsAuthor() {
        $scope.template.comments.forEach(function(comment) {
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
        template.comments.push(comment);
        
        $scope.template.$update({
          id: template._id
        }).then(function(res) {
          console.log("Commento inserito");
          $scope.template = res;
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
          
          var index = $scope.template.preferences.indexOf($scope.currentPreference);
          $scope.template.preferences.splice(index, 1);
          
          var preference = {};
          preference.author = $rootScope.currentUser._id;
          preference.type = type;
          
          $scope.template.preferences.push(preference);
          $scope.template.$update({
            id: template._id
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
          
          $scope.template.preferences.push(preference);
          $scope.template.$update({
            id: template._id
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
    
    TemplatesCreateController.$inject = ['$scope', 'Templates', 'tags', '$rootScope', '$state', 'FileUploader', 'API_URL'];
    
    function TemplatesCreateController($scope, Templates, tags, $rootScope, $state, FileUploader, API_URL){
        
        var tc = this;
		
        tc.inizialize    = inizialize;
        tc.transformChip = transformChip;
				tc.searchTags    = searchTags;
				tc.addTag        = addTag;
				tc.removeTag     = removeTag;
        tc.save          = save;
        
        tc.inizialize();
        
        return tc;
        
        
        function inizialize() {
        
          $scope.template           = new Templates();
          $scope.template.author    = $rootScope.currentUser._id;
          $scope.template.documents = [];
          $scope.template.tags      = [];
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
            $scope.template.documents.push({
              documentUrl : response.url
            });
          };
          uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
          };
          uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
            var i = $scope.template.documents.indexOf({documentUrl : response.url});
            $scope.template.documents.splice(i, 1);
          };
          uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
          };
          uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
            tc.save();
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
				    if($scope.template.tags.indexOf(tag.title) == -1) {
					    $scope.template.tags.push(tag.title);
						}
						$scope.selectedItemTag = null;
			    }
			    
		    }
		    
		    function removeTag(tag) {
			    
			    var index = $scope.template.tags.indexOf(tag.title);
			    $scope.template.tags.splice(index, 1);
			    
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
          console.log("save!");
          if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
            $scope.template.valid = true;
          }
          $scope.template.$save(
            null,
            success,
            error
          );
          
        }
        
        function success(res) {
          console.log("OK");
          $state.go('app.templates');
          $rootScope.showSimpleToast("Template creato!");
        }
        
        function error() {
          console.log("ERROR");
        }
		
		}
 
    
    TemplatesEditController.$inject = ['$scope', 'Templates', 'template', 'tags', '$state', '$rootScope', 'FileUploader', 'API_URL', '$q'];
    
    function TemplatesEditController($scope, Templates, template, tags, $state, $rootScope, FileUploader, API_URL, $q){
        
      var tc = this;
  
      tc.inizialize       = inizialize;
      tc.transformChip    = transformChip;
			tc.searchTags       = searchTags;
			tc.addTag           = addTag;
			tc.removeTag        = removeTag;
      tc.save             = save;
      tc.remove           = remove;
      tc.eliminaDocumento = eliminaDocumento;
  
      tc.inizialize();
  
      return tc;
      
      function inizialize() {
	      
	      $scope.tagMod = false;
	      $scope.selectedTags = [];
	      var promises        = [];
	      
	      promises.push(tags.$promise.then(function(res) {
					$scope.tags = res;
				}));
        
        promises.push(template.$promise.then(function(res) {
          $scope.template = res;
          $scope.newTemplate = new Templates();
          $scope.newTemplate.title = $scope.template.title;
          $scope.newTemplate.author = $scope.template.author;
          $scope.newTemplate.documents = $scope.template.documents;
          $scope.newTemplate.commments = $scope.template.comments;
          $scope.newTemplate.preferences = $scope.template.preferences;
          $scope.newTemplate.description = $scope.template.description;
          $scope.newTemplate.tags = [];
	        angular.copy($scope.template.tags, $scope.newTemplate.tags);
          $scope.newTemplate.version = $scope.template.versione += 1;
          $scope.newTemplate.father = $scope.template._id;
        }));
        
        $q.all(promises).then(function() {
        
	        $scope.template.tags.forEach(function(tag) {
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
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
          console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
          console.info('onCompleteAll');
          $scope.newTemplate.documents = $scope.urls;
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
			    if($scope.newTemplate.tags.indexOf(tag.title) == -1) {
				    $scope.newTemplate.tags.push(tag.title);
					}
					$scope.selectedItemTag = null;
		    }
		    
	    }
	    
	    function removeTag(tag) {
		    
		    $scope.tagMod = true;
		    var index = $scope.newTemplate.tags.indexOf(tag.title);
		    $scope.newTemplate.tags.splice(index, 1);
		    
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
        console.log("save new template");
        if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
          $scope.newTemplate.valid = true;
        }   
        $scope.newTemplate.documents = $scope.urls;
        $scope.newTemplate.$save(
          null,
          successUpdate,
          errorSave
        );
              
      }
      
      function eliminaDocumento(doc) {
        var i = $scope.newTemplate.documents.indexOf(doc);
        $scope.newTemplate.documents.splice(i, 1);
      }
      
      // function successSave(res) {
      //   console.log("OK");
      //   $scope.newTemplate = res;
      //   $scope.newTemplate.$update(
      //     {
      //       id: $scope.newTemplate._id
      //     },
      //     successUpdate,
      //     errorUpdate
      //   );
      // }
      
      function remove() {
        $scope.template.$delete({
          id: $scope.template._id
        },
        successDelete,
        errorDelete);
      }
      
      
      function errorSave() {
        console.log("ERROR");
      }
      function successUpdate(res) {
        console.log("OK UPDATE");
        $state.go('app.templates');
        $rootScope.showSimpleToast("Template modificato!");
      }
      function errorUpdate() {
        console.log("ERROR UPDATE");
      }
      function successDelete() {
        console.log("DELETED");
        $state.go('app.templates');
        $rootScope.showSimpleToast("Template eliminato!");     
      }
      function errorDelete() {
        console.log("DELETE ERROR");
      }
	}
})();