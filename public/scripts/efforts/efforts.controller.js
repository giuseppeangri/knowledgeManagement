(function() {
  'use strict';
  
  angular
    .module('app.efforts')
    .controller('EffortsController', EffortsController);
    
    EffortsController.$inject = ['$rootScope', '$scope', 'Efforts', 'efforts', 'Users'];
    
    function EffortsController($rootScope, $scope, Efforts, efforts, Users) {
      
      var ec = this;
      
      ec.inizialize = inizialize;
      ec.save = save;
      ec.remove = remove;
      ec.update = update;
      ec.edit = edit;
      
      ec.inizialize();
      
      return ec;
      
      function inizialize() {

        efforts.$promise.then(function (res) {
          $scope.efforts = res;
          
          $scope.efforts.forEach(function(effort) {
		        Users.getCached({
		          id: effort.author
		        }).$promise.then(function(res) {
		          effort.authorName = res.name;
		          effort.authorLastName = res.lastName;
		        });
		      }, this);

        });

      }
      
      function remove(effort) {
        effort.$delete({
          id : effort._id
        },
        null,
        successDelete(effort),
        errorDelete);
      }
      
      function save() {
        if($scope.newEffortTitle) {
          console.log("ADD EFFORT");
          var effort = new Efforts();
          effort.author = $rootScope.currentUser._id;
          effort.title = $scope.newEffortTitle;
          effort.$save(
            null,
            successSave,
            errorSave
          );
        }
      }
      
      function edit(effort) {
        effort.edit = !effort.edit;
      }
      
      function update(effort) {

        if(effort.title) {
	        
          effort.$update({
            id: effort._id
          }).then(function(res) {
	          res.authorName = $rootScope.currentUser.name;
		        res.authorLastName = $rootScope.currentUser.lastName;
		        res.edit = false;
          });
          
        }
        
      }
            
      function successSave(res) {
        res.authorName = $rootScope.currentUser.name;
        res.authorLastName = $rootScope.currentUser.lastName;
        $scope.efforts.push(res);
        console.log("SUCCESS");
        $scope.newEffortTitle = "";
      }
      function errorSave() {
        console.log("ERROR");
      }
      
      function successDelete(effort) {
        console.log("SUCCESS DELETE");    
        var i = $scope.efforts.indexOf(effort);
        $scope.efforts.splice(i, 1);
      }
      function errorDelete() {
        console.log("ERROR DELETE");
      }     
      
      
    }
    
})();