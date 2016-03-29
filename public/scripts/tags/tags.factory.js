(function() {
	
	'use strict';
	
	angular
		.module('app.tags')
		.factory('Tags', Tags);
	
	Tags.$inject = ['$resource', 'API_URL'];	
	
	function Tags($resource, API_URL) {
		
		var url = API_URL + 'tags/:id';
		var tagsFactory = $resource(
			url,
			{ id : '@id' },
			{ 
				delete									: { method : 'DELETE' },
				update 									: { method : 'PATCH' },
        getCached               : { cache: true }
			}
		);
				
		return tagsFactory;
		
	}
	
})();