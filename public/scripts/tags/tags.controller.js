(function() {
  'use strict';
  
  angular
    .module('app.tags')
    .controller('TagsController', TagsController);
    
    TagsController.$inject = ['$rootScope', '$scope', 'Tags', 'tags', 'Users'];
    
    function TagsController($rootScope, $scope, Tags, tags, Users) {
      
      var ec = this;
      
      ec.inizialize = inizialize;
      ec.save = save;
      ec.remove = remove;
      ec.update = update;
      ec.edit = edit;
      
      ec.inizialize();
      
      return ec;
      
      function inizialize() {

        tags.$promise.then(function (res) {
          $scope.tags = res;

          $scope.tags.forEach(function (tag) {
            Users.getCached({
              id: tag.author
            }).$promise.then(function (res) {
              tag.authorName = res.name;
		          tag.authorLastName = res.lastName;
            });
          }, this);

        });

      }
      
      function remove(tag) {
        tag.$delete({
          id : tag._id
        },
        null,
        successDelete(tag),
        errorDelete);
      }
      
      function save() {
        if($scope.newTagTitle) {
          console.log("ADD EFFORT");
          var tag = new Tags();
          tag.author = $rootScope.currentUser._id;
          tag.title = $scope.newTagTitle;
          tag.$save(
            null,
            successSave,
            errorSave
          );
        }
      }
      
      function edit(tag) {
        tag.edit = !tag.edit;
      }
      
      function update(tag) {
        if(tag.title) {
          tag.$update({
            id: tag._id
          }).then(function(res) {
	          res.authorName = $rootScope.currentUser.name;
		        res.authorLastName = $rootScope.currentUser.lastName;
		        res.edit = false;
          });;
        }
      }
      
      function successSave(res) {
        res.authorName = $rootScope.currentUser.name;
        res.authorLastName = $rootScope.currentUser.lastName;
        $scope.tags.push(res);
        console.log("SUCCESS");
        $scope.newTagTitle = "";
      }
      function errorSave() {
        console.log("ERROR");
      }
      
      function successDelete(tag) {
        console.log("SUCCESS DELETE");    
        var i = $scope.tags.indexOf(tag);
        $scope.tags.splice(i, 1);
      }
      function errorDelete() {
        console.log("ERROR DELETE");
      }     
      
      
    }
    
})();