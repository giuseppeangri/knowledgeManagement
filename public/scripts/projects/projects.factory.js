  (function() {
    
    'use strict';
    
    angular
      .module('app.projects')
      .factory('Projects', Projects);
    
    Projects.$inject = ['$resource', 'API_URL'];	
    
    function Projects($resource, API_URL) {
      
      var url = API_URL + 'projects/:id';
      var projectsFactory = $resource(
        url,
        { id : '@id' },
        { 
          delete									: { method : 'DELETE' },
          update 									: { method : 'PATCH' },
          getByComponentsId       : { method : 'GET', url: url + '?query={"$or":[ { "projectManagers.userId" : ":userId"},  { "teamMembers.userId" : ":userId"}] }', isArray: true },
          getByEffort             : { method : 'GET', url: url + '?query={ "efforts.type": ":type" }', isArray: true },
          getByMetric             : { method : 'GET', url: url + '?query={ "metrics.type": ":type" }', isArray: true }
        }
      );
      return projectsFactory;
    }
  })();