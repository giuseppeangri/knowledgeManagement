(function() {
  'use strict';
  
  angular
    .module('app.metrics')
    .controller('MetricsController', MetricsController);
    
    MetricsController.$inject = ['$rootScope', '$scope', 'Metrics', 'metrics', 'Users'];
    
    function MetricsController($rootScope, $scope, Metrics, metrics, Users) {
      
      var ec = this;
      
      ec.inizialize = inizialize;
      ec.save = save;
      ec.remove = remove;
      ec.update = update;
      ec.edit = edit;
      
      ec.inizialize();
      
      return ec;
      
      function inizialize() {
                
        metrics.$promise.then(function(res) {
          $scope.metrics = res;
          
          $scope.metrics.forEach(function(metric) {
	          Users.getCached({
	            id: metric.author
	          }).$promise.then(function(res) {
	            metric.authorName = res.name;
		          metric.authorLastName = res.lastName;
	          });
        }, this);
          
        });
        
      }
      
      function remove(metric) {
        metric.$delete({
          id : metric._id
        },
        null,
        successDelete(metric),
        errorDelete);
      }
      
      function save() {
        if($scope.newMetricTitle) {
          console.log("ADD EFFORT");
          var metric = new Metrics();
          metric.author = $rootScope.currentUser._id;
          metric.title = $scope.newMetricTitle;
          metric.$save(
            null,
            successSave,
            errorSave
          );
        }
      }
      
      function edit(metric) {
        metric.edit = !metric.edit;
      }
      
      function update(metric) {
        if(metric.title) {
          metric.$update({
            id: metric._id
          }).then(function(res) {
	          res.authorName = $rootScope.currentUser.name;
		        res.authorLastName = $rootScope.currentUser.lastName;
		        res.edit = false;
          });;
        }
      }
      
      function successUpdate(metric) {
        metric.author = $rootScope.currentUser;
        console.log("SUCCESS UPDATE");
        metric.edit = !metric.edit;
      }
      function successSave(res) {
        res.authorName = $rootScope.currentUser.name;
        res.authorLastName = $rootScope.currentUser.lastName;
        $scope.metrics.push(res);
        console.log("SUCCESS");
        $scope.newMetricTitle = "";
      }
      function errorSave() {
        console.log("ERROR");
      }
      
      function successDelete(metric) {
        console.log("SUCCESS DELETE");    
        var i = $scope.metrics.indexOf(metric);
        $scope.metrics.splice(i, 1);
      }
      function errorDelete() {
        console.log("ERROR DELETE");
      }     
      
      
    }
    
})();