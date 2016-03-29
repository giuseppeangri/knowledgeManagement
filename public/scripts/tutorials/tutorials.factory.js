(function() {
	
	'use strict';
	
	angular
		.module('app.tutorials')
		.factory('Tutorials', Tutorials);
	
	Tutorials.$inject = ['$resource', 'API_URL'];	
	
	function Tutorials($resource, API_URL) {
		
		var url = API_URL + 'tutorials/:id';
		var tutorialsFactory = $resource(
			url,
			{ id : '@id' },
			{ 
				delete									: { method : 'DELETE' },
				update 									: { method : 'PATCH' },
        getByUserId             : { method : 'GET', url: url + '?query={"author" : ":userId"}', isArray: true }
			}
		);
				
		return tutorialsFactory;
		
	}
	
})();