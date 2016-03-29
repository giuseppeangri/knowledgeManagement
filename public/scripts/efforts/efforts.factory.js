(function() {
	
	'use strict';
	
	angular
		.module('app.efforts')
		.factory('Efforts', Efforts);
	
	Efforts.$inject = ['$resource', 'API_URL'];	
	
	function Efforts($resource, API_URL) {
		
		var url = API_URL + 'efforts/:id';
		var effortsFactory = $resource(
			url,
			{ id : '@id' },
			{ 
				delete									: { method : 'DELETE' },
				update 									: { method : 'PATCH' },
        getCached               : { cache: true }
			}
		);
				
		return effortsFactory;
		
	}
	
})();