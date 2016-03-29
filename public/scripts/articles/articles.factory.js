(function() {
	
	'use strict';
	
	angular
		.module('app.articles')
		.factory('Articles', Articles);
	
	Articles.$inject = ['$resource', 'API_URL'];	
	
	function Articles($resource, API_URL) {
		
		var url = API_URL + 'articles/:id';
		var articlesFactory = $resource(
			url,
			{ id : '@id' },
			{ 
				delete									: { method : 'DELETE' },
				update 									: { method : 'PATCH' },
        getValid                : { method : 'GET', url: url + '?query={"valid": "true"}', isArray : true },
        getInvalid              : { method : 'GET', url: url + '?query={"valid": "false"}', isArray : true },
        getByUserId             : { method : 'GET', url: url + '?query={"author": ":userId"}', isArray: true },
        invalidCount            : { method : 'GET', url: url + '/count/?query={"valid":"false"}' }
			}
		);
				
		return articlesFactory;
		
	}
	
})();