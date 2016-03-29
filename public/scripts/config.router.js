(function() {
  
  'use strict';
  
  angular
    .module('app')
    .run(run)
    .config(config)
    .factory('redirectWhenLoggedOut', redirectWhenLoggedOut);
    
  redirectWhenLoggedOut.$inject = ['$q', '$injector'];
  
  function redirectWhenLoggedOut($q, $injector) {
		return {
		
			responseError: function(rejection) {
	
				if(rejection.data.error === 'unauthorized') {
					localStorage.removeItem('user');
					$injector.get('$state').go('guest');
				}
		
				return $q.reject(rejection);
			}
		}
	}
    
  run.$inject = ['$rootScope', '$state', '$stateParams', 'Users', '$http'];
  
  function run($rootScope, $state, $stateParams, Users, $http) {
	  
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
	    
	    var user = JSON.parse(localStorage.getItem('user'));
	    
			if( toState.name !== 'guest' && !user ) {
			  event.preventDefault();
			  $state.go('guest');
			}
			else if( toState.name == 'guest' && user ) {
				event.preventDefault();
			  $state.go('app.home');
			}
			
		});
    
    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
	    
	    var user = JSON.parse(localStorage.getItem('user'));	
	    
	    if(user){
        
        $rootScope.authenticated = true;
        $rootScope.currentUser = user;
		    
			  $http.defaults.headers.common['token'] = user.token;
		    Users.get({
			    id : user._id
		    }).$promise.then(function(res) {
			    if(!res.token) {
				    $rootScope.authenticated = false;
				    $rootScope.currentUser = null;
				    localStorage.removeItem('user');
						$state.go('guest');
			    }
		    });
		    
	    }
			else {
				$state.go('guest');
			}
			
		});
		
  }
  
  config.$inject = ['$stateProvider', '$urlRouterProvider', 'MODULE_CONFIG', '$provide', '$httpProvider'];
  
  function config($stateProvider,   $urlRouterProvider,  MODULE_CONFIG, $provide, $httpProvider) {
	  
	  var user = JSON.parse(localStorage.getItem('user'));
	  
    if(user){
		  $httpProvider.defaults.headers.common['token'] = user.token;
		}

		$httpProvider.interceptors.push('redirectWhenLoggedOut');
	  
    $urlRouterProvider
      .otherwise('/app/home');
    $stateProvider
      // state provider
      .state('guest', {
        url: '/',
        templateUrl: 'views/pages/guest.html',
        controller: 'AuthenticationController',
        controllerAs: 'AuthenticationCtrl',
      })
      .state('app', {
        abstract: true,
        url: '/app',
        views: {
          '': {
            templateUrl: 'views/layout.html',
            controller: 'AppCtrl'        
          },
          'aside': {
            templateUrl: 'views/aside.html',
            controller: 'AppCtrl'
          },
          'content': {
            templateUrl: 'views/content.html',
            controller: 'AppCtrl'
          }
        },
      })
        // home state
        .state('app.home', {
          url: '/home',
          templateUrl: 'views/pages/home.html',
          data : {
            title: 'Home', 
            folded: true, 
            theme: { primary: 'asphalt'} 
           },
          controller: 'HomeController',
          controllerAs: 'HomeCtrl'
        })
        // article state
        .state('app.articles', {
          url: '/articles',
          templateUrl: 'views/pages/articles/index.html',
          data : { 
            title: 'Articoli', 
            folded: true,
            theme: {
              primary: 'turquoise'
            }
          },
          controller: 'ArticlesController',
          controllerAs: 'ArticlesCtrl',
          resolve: {
            articles: ArticleIndexResolve
          }
        })
          //articles create
          .state('app.articlesCreate', {
            url: '/articles/create',
            templateUrl: 'views/pages/articles/create.html',
            data : { 
              title: 'Nuovo Articolo', 
              folded: true 
            },
            controller: 'ArticlesCreateController',
            controllerAs: 'ArticlesCreateCtrl',
            resolve: {
	            tags: TagIndexResolve
            }
          })
          // articles router
          // articles show
          .state('app.articlesShow', {
            url: '/articles/:id',
            templateUrl: 'views/pages/articles/show.html',
            data : { 
              title: 'Articoli', 
              folded: true 
            },
            controller: 'ArticlesShowController',
            controllerAs: 'ArticlesShowCtrl',
            resolve: {
              article: ArticleShowResolve
            },
          })
          // articles edit
          .state('app.articlesEdit', {
            url: '/articles/edit/:id',
            templateUrl: 'views/pages/articles/edit.html',
            data : { 
              title: 'Aggiorna Articolo', 
              folded: true 
            },
            controller: 'ArticlesEditController',
            controllerAs: 'ArticlesEditCtrl',
            resolve: {
              article: ArticleShowResolve,
	            tags: TagIndexResolve
            }
          })   
        // projects state
        .state('app.projects', {
          url: '/projects',
          templateUrl: 'views/pages/projects/index.html',
          data : {
            title : 'Progetti',
            folded: true,
            theme: {
                primary: 'turquoise'
              }
          },
          controller: 'ProjectsController',
          controllerAs: 'ProjectsShowCtrl',
          resolve: {
            projects: ProjectIndexResolve
          }
        })
          // projects router
          // projects create
          .state('app.projectsCreate', {
            url: '/projects/create',
            templateUrl: 'views/pages/projects/create.html',
            data : { 
              title: 'Nuovo Progetto', 
              folded: true
            },
            controller: 'ProjectsCreateController',
            controllerAs: 'ProjectsCreateCtrl',
            resolve: {
	            users: UserIndexResolve,
	            tools: ToolIndexResolve,
	            efforts: EffortIndexResolve,
	            metrics: MetricIndexResolve,
	            tags: TagIndexResolve
	          }
          })
          // effort stat
          .state('app.projectsEffortStatics', {
            url: '/projects/effortStatics',
            templateUrl: 'views/pages/projects/effort-statics.html',
            data : {
              title: 'Statistiche Effort Progetti',
              folded: true
            },
            controller: 'ProjectStatController',
            controllerAs: 'ProjectStatCtrl',
            resolve: {
              stats: ProjectEffortResolve,
              type: function() {
                return 0;
              }
            }
          })
          // metric stat
          .state('app.projectsMetricStatics', {
            url: '/projects/metricStatics',
            templateUrl: 'views/pages/projects/metric-statics.html',
            data : {
              title: 'Statistiche Metriche Progetti',
              folded: true
            },
            controller: 'ProjectStatController',
            controllerAs: 'ProjectStatCtrl',
            resolve: {
              stats: ProjectMetricResolve,
              type: function() {
                return 1;
              }
            }
          })
          // projects show
          .state('app.projectsShow', {
            url: '/projects/:id',
            templateUrl: 'views/pages/projects/show.html',
            data : { 
              title: 'Progetti', 
              folded: true 
            },
            controller: 'ProjectsShowController',
            controllerAs: 'ProjectsShowCtrl',
            resolve: {
              project: ProjectShowResolve
            }
          })
          // projects edit
          .state('app.projectsEdit', {
            url: '/projects/edit/:id',
            templateUrl: 'views/pages/projects/edit.html',
            data : { 
              title: 'Aggiorna Progetto', 
              folded: true 
            },
            controller: 'ProjectsEditController',
            controllerAs: 'ProjectsEditCtrl',
            resolve: {
              project: ProjectShowResolve,
              users: UserIndexResolve,
	            tools: ToolIndexResolve,
	            efforts: EffortIndexResolve,
	            metrics: MetricIndexResolve,
	            tags: TagIndexResolve
            }
          })   
        // templates state
        .state('app.templates', {
          url: '/templates',
          templateUrl: 'views/pages/templates/index.html',
          data : {
            title: 'Template',
            folded: true,
            theme: {
                primary: 'emerald'
            }
          },
          controller: 'TemplatesController',
          controllerAs: 'TemplatesShowCtrl',
          resolve: {
            templates: TemplateIndexResolve
          }
        })
          // templates router
          // templates create
          .state('app.templatesCreate', {
            url: '/templates/create',
            templateUrl: 'views/pages/templates/create.html',
            data : { 
              title: 'Nuovo Template', 
              folded: true 
            },
            controller: 'TemplatesCreateController',
            controllerAs: 'TemplatesCreateCtrl',
            resolve: {
	            tags: TagIndexResolve
            }
          })
          // templates show
          .state('app.templatesShow', {
            url: '/templates/:id',
            templateUrl: 'views/pages/templates/show.html',
            data : { 
              title: 'Template', 
              folded: true 
            },
            controller: 'TemplatesShowController',
            controllerAs: 'TemplatesShowCtrl',
            resolve: {
              template: TemplateShowResolve
            }
          })
          // templates edit
          .state('app.templatesEdit', {
            url: '/templates/edit/:id',
            templateUrl: 'views/pages/templates/edit.html',
            data : { 
              title: 'Aggiorna Template', 
              folded: true 
            },
            controller: 'TemplatesEditController',
            controllerAs: 'TemplatesEditCtrl',
            resolve: {
              template: TemplateShowResolve,
	            tags: TagIndexResolve
            }
          })
        // tools state
        .state('app.tools', {
          url: '/tools',
          templateUrl: 'views/pages/tools/index.html',
          data: {
            title: 'Strumenti',
            folded: true,
            theme: {
              primary: 'river'
            }
          },
          controller: 'ToolsController',
          controllerAs: 'ToolsCtrl',
          resolve: {
            tools: ToolIndexResolve
          }
        })
          // tools router
          // tools create
          .state('app.toolsCreate', {
            url: '/tools/create',
            templateUrl: 'views/pages/tools/create.html',
              data : { 
                title: 'Nuovo Strumento', 
                folded: true 
              },
            controller: 'ToolsCreateController',
            controllerAs: 'ToolsCreateCtrl',
            resolve: {
	            tags: TagIndexResolve
            }
          })
          // tools show
          .state('app.toolsShow', {
            url: '/tools/:id',
            templateUrl: 'views/pages/tools/show.html',
            data : { 
              title: 'Strumenti', 
              folded: true 
            },
            controller: 'ToolsShowController',
            controllerAs: 'ToolsShowCtrl',            
            resolve: {
              tool: ToolShowResolve
            }
          })
          // tools edit
          .state('app.toolsEdit', {
            url: '/toolsedit/:id',
            templateUrl: 'views/pages/tools/edit.html',
            data : { 
              title: 'Aggiorna Strumento', 
              folded: true 
            },
            controller: 'ToolsEditController',
            controllerAs: 'ToolsEditCtrl',
            resolve: {
              tool: ToolShowResolve,
	            tags: TagIndexResolve
            }
          })
        // tutorials state
        .state('app.tutorials', {
          url: '/tutorials',
          templateUrl: 'views/pages/tutorials/index.html',
          data : {
            title: 'Tutorial',
            folded: true,
            theme: {
              primary: 'amethyst'
            }
          },
          controller: 'TutorialsController',
          controllerAs: 'TutorialsCtrl',
          resolve: {
            tutorials: TutorialIndexResolve
          }
        })
          // tutorials router
          // tutorials create
          .state('app.tutorialsCreate', {
            url: '/tutorials/create',
            templateUrl: 'views/pages/tutorials/create.html',
            data : { 
              title: 'Nuovo Tutorial', 
              folded: true 
            },
            controller: 'TutorialsCreateController',
            controllerAs: 'TutorialsCreateCtrl',
            resolve: {
	            tags: TagIndexResolve
            }
          })
          // tutorial show
          .state('app.tutorialsShow', {
            url: '/tutorials/:id',
            templateUrl: 'views/pages/tutorials/show.html',
            data : { 
              title: 'Tutorial',
              folded: true 
            },
            controller: 'TutorialsShowController',
            controllerAs: 'TutorialsShowCtrl',
            resolve: {
              tutorial: TutorialShowResolve
            }
          })
          // tutorials edit
          .state('app.tutorialsEdit', {
            url: '/tutorials/edit/:id',
            templateUrl: 'views/pages/tutorials/edit.html',
            data : { 
              title: 'Aggiorna Tutorial', 
              folded: true 
            },
            controller: 'TutorialsEditController',
            controllerAs: 'TutorialsEditCtrl',
            resolve: {
              tutorial: TutorialShowResolve,
	            tags: TagIndexResolve,
            }
          })
          
        // admin state 
        .state('app.adminValidation', {
          url: '/admin/validation',
          templateUrl: 'views/pages/admin/validation.html',
          data : {
            title: 'Valida Contenuti',
            folded: true
          },
          controller: 'AdminController',
          controllerAs: 'AdminCtrl'
        })
        
        // effort state
        .state('app.effort', {
          url: '/effort',
          templateUrl: 'views/pages/effort/index.html',
          data: {
            title: 'Effort',
            folded: true
          },
          controller: 'EffortsController',
          controllerAs: 'EffortsCtrl',
          resolve: {
            efforts: EffortIndexResolve
          }
        })
        // metric state
        .state('app.metric', {
          url: '/metric',
          templateUrl: 'views/pages/metric/index.html',
          data: {
            title: 'Metriche di Size',
            folded: true
          },
          controller: 'MetricsController',
          controllerAs: 'MetricsCtrl',
          resolve: {
            metrics: MetricIndexResolve
          }
        })
        
        // tag state
        .state('app.tag', {
          url: '/tag',
          templateUrl: 'views/pages/tag/index.html',
          data: {
            title: 'Tag',
            folded: true
          },
          controller: 'TagsController',
          controllerAs: 'TagsCtrl',
          resolve: {
            tags: TagIndexResolve
          }
        })
        
        // user state
        .state('app.users', {
          url: '/user',
          templateUrl: 'views/pages/user/index.html',
          data : {
            title: 'Utenti iscritti alla piattaforma',
            folded: true
          },
          controller: 'UsersController',
          controllerAs: 'UserCtrl',
          resolve: {
            user: UserIndexResolve
          }
          
        })
          // user router
          .state('app.usersShow', {
            url: '/user/:id',
            templateUrl: 'views/pages/user/show.html',
            data : { 
              title: 'Profilo Personale', 
              folded: true 
            },
            controller: 'UsersShowController',
            controllerAs: 'UsersShowCtrl',
            resolve: {
              user: UserShowResolve
            }
          })
          .state('app.usersEdit', {
            url: '/userEdit/:id',
            templateUrl: 'views/pages/user/edit.html',
            data : { 
              title: 'Aggiorna Profilo Personale', 
              folded: true 
            },
            controller: 'UsersEditController',
            controllerAs: 'UsersEditCtrl',
            resolve: {
             user: UserShowResolve
            } 
          });
              
  }
  
  ArticleIndexResolve.$inject = ['Articles'];
  
  function ArticleIndexResolve(Articles) {
    return Articles.getValid();
  }
  
  ArticleShowResolve.$inject = ['Articles', '$stateParams'];
  
  function ArticleShowResolve(Articles, $stateParams) {
    return Articles.get({
      id: $stateParams.id
    });
  }
  
  ProjectIndexResolve.$inject = ['Projects'];
  
  function ProjectIndexResolve(Projects) {
    return Projects.query();
  }
  
  ProjectShowResolve.$inject = ['Projects', '$stateParams'];
  
  function ProjectShowResolve(Projects, $stateParams) {
    return Projects.get({
      id: $stateParams.id
    });
  }
  
  ProjectEffortResolve.$inject = ['Efforts'];

  function ProjectEffortResolve(Efforts) {
    return Efforts.query();
  }

  ProjectMetricResolve.$inject = ['Metrics'];

  function ProjectMetricResolve(Metrics) {
    return Metrics.query();
  }
  
  TemplateIndexResolve.$inject = ['Templates'];
  
  function TemplateIndexResolve(Templates) {
    return Templates.getValid();
  }
  
  TemplateShowResolve.$inject = ['Templates', '$stateParams'];
  
  function TemplateShowResolve(Templates, $stateParams) {
    return Templates.get({
      id: $stateParams.id
    });
  }
  
  ToolIndexResolve.$inject = ['Tools'];
  
  function ToolIndexResolve(Tools) {
    return Tools.query();
  }
  
  ToolShowResolve.$inject = ['Tools', '$stateParams'];
  
  function ToolShowResolve(Tools, $stateParams) {
    return Tools.get({
      id: $stateParams.id
    });
  }
  
  TutorialIndexResolve.$inject = ['Tutorials'];
  
  function TutorialIndexResolve(Tutorials) {
    return Tutorials.query();
  }
  
  TutorialShowResolve.$inject = ['Tutorials', '$stateParams'];
  
  function TutorialShowResolve(Tutorials, $stateParams) {
    return Tutorials.get({
      id: $stateParams.id
    });
  }
  
  UserIndexResolve.$inject = ['Users'];
  
  function UserIndexResolve(Users) {
    return Users.getValid();
  }
  
  UserShowResolve.$inject = ['Users', '$stateParams'];
  
  function UserShowResolve(Users, $stateParams) {
    return Users.getCached({
	    id: $stateParams.id
    });
  }
  
  EffortIndexResolve.$inject = ['Efforts'];
  
  function EffortIndexResolve(Efforts) {
    return Efforts.query();
  }
  
  MetricIndexResolve.$inject = ['Metrics'];
  
  function MetricIndexResolve(Metrics) {
    return Metrics.query();
  }
  
  TagIndexResolve.$inject = ['Tags'];
  
  function TagIndexResolve(Tags) {
    return Tags.query();
  }
  
})();