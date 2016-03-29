(function() {
	
	'use strict';
	
	angular
		.module('app.authentication')
		.factory('Base64', Base64)
		.controller('AuthenticationController', AuthenticationController)
    .controller('HomeController', HomeController);
		
	function Base64() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZabcdef' +
            'ghijklmnopqrstuv' +
            'wxyz0123456789+/' +
            '=';
            
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

	}
	
	AuthenticationController.$inject = ['$scope', 'Base64', '$http', '$rootScope', '$state', 'AUTH_URL', 'Users'];
	
	function AuthenticationController($scope, Base64, $http, $rootScope, $state, AUTH_URL, Users) {
		
		var ac = this;
		
		ac.inizialize = inizialize;
		ac.setChoice = setChoice;
		ac.login = login;
		ac.signup = signup;
		
		ac.inizialize();
		
		return ac;
		
		function inizialize() {
			
			$scope.loginData = {
				email : '',
				password: ''
			};
			
			$scope.signupData = new Users();
						
		}
		
		function login() {
			
			var base64 = Base64.encode( $scope.loginData.email + ':' + $scope.loginData.password );
			
			$http.defaults.headers.common['Authorization'] = 'Basic ' + base64;
			
			$http({ method: 'POST', url: AUTH_URL }).then(function(response) {
				
				if(response.data.token) {
					var user = JSON.stringify(response.data);
					localStorage.setItem('user', user);

					$rootScope.authenticated = true;
					$rootScope.currentUser = user;
					$state.go('app.home');
					
				}
				else {
					console.log("AUTH FAILED");
				}
				
			});
			
		}
		
		function setChoice(index) {
      $scope.choice = index;
    }
    
    function signup() {
	    $scope.signupData.$save().then(function(res) {
		    console.log(res);
		    console.log('OK');
	    });
    }
	
	}
  
  HomeController.$inject = ['$scope', 'Articles', 'Templates', 'Tools', 'Tutorials', '$q'];
  
  function HomeController($scope, Articles, Templates, Tools, Tutorials, $q) {
    
    var hc = this;
    
    hc.inizialize = inizialize;
    
    hc.inizialize();
    
    return hc;
    
    function inizialize() {
      
      $scope.index = [];
      
      $q.all([Articles.getValid().$promise, Templates.getValid().$promise, Tools.query().$promise, Tutorials.query().$promise])
        .then(function(result) {
          result.forEach(function(elements, type) {
            elements.forEach(function(singleElement) {
              singleElement.type = type;
              $scope.index.push(singleElement);
            }, this);
          }, this);
        });
    }
  }
	
})();