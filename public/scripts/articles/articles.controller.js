(function() {	
  'use strict';
  
  angular
    .module('app.articles')
	  .controller('ArticlesController', ArticlesController)
		.controller('ArticlesShowController', ArticlesShowController)
		.controller('ArticlesCreateController', ArticlesCreateController)
		.controller('ArticlesEditController', ArticlesEditController);
	
	ArticlesController.$inject = ['$scope', 'Articles', 'articles', 'Users', '$rootScope'];
	
	function ArticlesController($scope, Articles, articles, Users, $rootScope) {
		
		var ac = this;
		
		ac.inizialize = inizialize;
		
		ac.inizialize();
		
		return ac;
		
		function inizialize() {
      
      $scope.currentUser = $rootScope.currentUser;
			
      articles.$promise.then(function(res) {
        $scope.articles = res;
        
        $scope.articles.forEach(function(article) {
          Users.getCached({
            id: article.author
          }).$promise.then(function(res) {
            article.author = res;
          });
        }, this);
        
      });		
		}    
    
	}
	
	ArticlesShowController.$inject = ['$scope', 'Articles', 'article', 'Users', '$rootScope'];
	
	function ArticlesShowController($scope, Articles, article, Users, $rootScope) {
		
	  var ac = this;
		
		ac.inizialize = inizialize;
		ac.addComment = addComment;
    ac.addPreference = addPreference;
    ac.getCommentsAuthor = getCommentsAuthor;
		ac.inizialize();
		
		return ac;
		
		function inizialize() {
      
      $scope.selectedTags = [];
      
			article.$promise.then(function(res) {
        
        $scope.article = res;
                
        $scope.like = 0;
        $scope.dontLike = 0;
        $scope.disabledLike = false;
        $scope.disabledDontLike = false;
        $scope.article.preferences.forEach(function(preference) {
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
          id: $scope.article.author
        }).$promise.then(function(res) {
          $scope.author = res;
        });
        
        $scope.article.tags.forEach(function(tag) {
	        $scope.selectedTags.push({
		        title : tag
	        });
        });
        
      });
		}
    
    function getCommentsAuthor() {
      $scope.article.comments.forEach(function(comment) {
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
      $scope.article.comments.push(comment);
      
      $scope.article.$update({
        id: article._id
      }).then(function(res) {
        console.log("Commento inserito");
        $scope.article = res;
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
        
        var index = $scope.article.preferences.indexOf($scope.currentPreference);
        $scope.article.preferences.splice(index, 1);
        
        var preference = {};
        preference.author = $rootScope.currentUser._id;
        preference.type = type;
        
        $scope.article.preferences.push(preference);
        $scope.article.$update({
          id: article._id
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
        
        $scope.article.preferences.push(preference);
        $scope.article.$update({
          id: article._id
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
  
  
	
	ArticlesCreateController.$inject = ['$scope', 'Articles', 'tags', '$rootScope', '$state'];
	
	function ArticlesCreateController($scope, Articles, tags, $rootScope, $state) {
		
		var ac = this;
		
		ac.inizialize    = inizialize;
		ac.transformChip = transformChip;
		ac.searchTags    = searchTags;
		ac.addTag        = addTag;
		ac.removeTag     = removeTag;
		ac.save          = save;
		
		ac.inizialize();
		
		return ac;
		
		function inizialize() {
      
			$scope.article          = new Articles();
      $scope.article.author 	= $rootScope.currentUser._id;
      $scope.article.tags   	= [];
			$scope.selectedTags     = [];
			
			tags.$promise.then(function(res) {
				$scope.tags = res;
			});
      
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
		    if($scope.article.tags.indexOf(tag.title) == -1) {
			    $scope.article.tags.push(tag.title);
				}
				$scope.selectedItemTag = null;
	    }
	    
    }
    
    function removeTag(tag) {
	    
	    var index = $scope.article.tags.indexOf(tag.title);
	    $scope.article.tags.splice(index, 1);
	    
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
      console.log($rootScope.currentUser);
      if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
        $scope.article.valid = true;
      }   
      console.log("save!");
			
			$scope.article.$save(
				null,
				success,
				error
			);
			
		}
		
		function success(res) {
			console.log("OK");
      $state.go('app.articles');
      if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
        $rootScope.showSimpleToast("Articolo creato!");
      }   
      else {
        $rootScope.showSimpleToast("Articolo creato e in attesa di convalida!");
      }
		}
		
		function error() {
			console.log("ERROR");
		}
		
	}
	
	ArticlesEditController.$inject = ['$scope', 'Articles', 'article', 'tags', '$state', '$rootScope', '$q'];
	
	function ArticlesEditController($scope, Articles, article, tags, $state, $rootScope, $q) {
		
		var ac = this;
		
		ac.inizialize    = inizialize;
		ac.transformChip = transformChip;
		ac.searchTags    = searchTags;
		ac.addTag        = addTag;
		ac.removeTag     = removeTag;
    ac.save        	 = save;
    ac.remove      	 = remove;
		
		ac.inizialize();
		
		return ac;
		
		function inizialize() {
			
			$scope.tagMod = false;
			$scope.selectedTags = [];
			var promises        = [];
			
			promises.push(tags.$promise.then(function(res) {
				$scope.tags = res;
			}));
      
			promises.push(article.$promise.then(function(res) {
        $scope.article = res;
        $scope.newArticle = new Articles();
        $scope.newArticle.title = $scope.article.title;
        $scope.newArticle.author = $scope.article.author;
        $scope.newArticle.text = $scope.article.text;
        $scope.newArticle.description = $scope.article.description;
        $scope.newArticle.tags = [];
        angular.copy($scope.article.tags, $scope.newArticle.tags);
        $scope.newArticle.version = $scope.article.versione += 1;
        $scope.newArticle.father = $scope.article._id;
                
      }));
      
      $q.all(promises).then(function() {
        
        $scope.article.tags.forEach(function(tag) {
	        $scope.selectedTags.push({
		        title : tag
	        });
        });
        
      });
		
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
		    if($scope.newArticle.tags.indexOf(tag.title) == -1) {
			    $scope.newArticle.tags.push(tag.title);
				}
				$scope.selectedItemTag = null;
	    }
	    
    }
    
    function removeTag(tag) {
	    
	    $scope.tagMod = true;
	    var index = $scope.newArticle.tags.indexOf(tag.title);
	    $scope.newArticle.tags.splice(index, 1);
	    
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
      
		  console.log("save new article");
      if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
        $scope.newArticle.valid = true;
      }   
			$scope.newArticle.$save(
				null,
				successSave,
				errorSave
			);			
		}
		
		function successSave(res) {
			console.log("OK");
      $scope.newArticle = res;
      
      if ($rootScope.currentUser.admin || $rootScope.currentUser.moderator) {
        $scope.article.$delete(
          {
            id: $scope.article._id
          },
          successUpdate,
          errorUpdate
        );
      }
      else {
        $state.go('app.articles');
        $rootScope.showSimpleToast("Articolo modificato!");
      } 
		}
    
    function remove() {
      $scope.article.$delete({
        id: $scope.article._id
      },
      successDelete,
      errorDelete);
    }
		
		function errorSave() {
			console.log("ERROR");
		}
    function successUpdate(res) {
			console.log("OK UPDATE");
      $state.go('app.articles');
      $rootScope.showSimpleToast("Articolo modificato!");
		}
    function errorUpdate() {
			console.log("ERROR UPDATE");
		}
		function successDelete() {
			console.log("DELETED");
      $state.go('app.articles');      
		}
    function errorDelete() {
			console.log("DELETE ERROR");
		}
	
	}
	
})();