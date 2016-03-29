(function() {
	
	'use strict';
	
	angular
		.module('app.users')
		.factory('Users', Users);
	
	Users.$inject = ['$resource', 'API_URL'];	
	
	function Users($resource, API_URL) {
		
		var url = API_URL + 'users/:id';
		var usersFactory = $resource(
			url,
			{ id : '@id' },
			{ 
				delete									: { method : 'DELETE' },
				update 									: { method : 'PATCH' },
        getInvalid              : { method : 'GET', url : url + '?query={"valid":"false"}', isArray : true },
        getValid                : { method : 'GET', url : url + '?query={"valid":"true"}', isArray : true },
        getCached               : { cached : true },
        invalidCount            : { method : 'GET', url: url + '/count/?query={"valid":"false"}' }
			}
		);
				
		return usersFactory;
		
	}
	
})();