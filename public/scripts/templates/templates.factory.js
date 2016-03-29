(function() {
	
	'use strict';
	
	angular
		.module('app.templates')
		.factory('Templates', Templates);
	
	Templates.$inject = ['$resource', 'API_URL'];	
	
	function Templates($resource, API_URL) {
		
		var url = API_URL + 'templates/:id';
		var templatesFactory = $resource(
			url,
			{ id : '@id' },
			{ 
				delete									: { method : 'DELETE' },
				update 									: { method : 'PATCH' },
        getValid                : { method : 'GET', url: url + '?query={"valid":"true"}', isArray : true},
        getInvalid              : { method : 'GET', url: url + '?query={"valid":"false"}', isArray : true},
        getByUserId             : { method : 'GET', url: url + '?query={"author": ":userId"}', isArray: true },
        invalidCount            : { method : 'GET', url: url + '/count/?query={"valid":"false"}' }
			}
		);
				
		return templatesFactory;
		
	}
	
})();