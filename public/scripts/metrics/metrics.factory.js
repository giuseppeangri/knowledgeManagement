(function() {
	
	'use strict';
	
	angular
		.module('app.metrics')
		.factory('Metrics', Metrics);
	
	Metrics.$inject = ['$resource', 'API_URL'];	
	
	function Metrics($resource, API_URL) {
		
		var url = API_URL + 'metrics/:id';
		var metricsFactory = $resource(
			url,
			{ id : '@id' },
			{ 
				delete									: { method : 'DELETE' },
				update 									: { method : 'PATCH' },
        getCached               : { cache: true }
			}
		);
				
		return metricsFactory;
		
	}
	
})();