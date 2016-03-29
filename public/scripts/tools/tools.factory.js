(function() {
	
	'use strict';
	
	angular
		.module('app.tools')
		.factory('Tools', Tools);
	
	Tools.$inject = ['$resource', 'API_URL'];	
	
	function Tools($resource, API_URL) {
		
		var url = API_URL + 'tools/:id';
		var toolsFactory = $resource(
			url,
			{ id : '@id' },
			{ 
				delete									: { method : 'DELETE' },
				update 									: { method : 'PATCH' },
        getByUserId             : { method : 'GET', url: url + '?query={"author": ":userId"}', isArray: true }
			}
		);
				
		return toolsFactory;
		
	}
	
})();