(function() {
  angular.module('app', ['ionic']);

}).call(this);

(function() {
  var Bootstrap;

  Bootstrap = (function() {
    function Bootstrap($ionicPlatform) {
      $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
          return StatusBar.styleDefault();
        }
      });
    }

    return Bootstrap;

  })();

  angular.module('app').run(['$ionicPlatform', Bootstrap]);

}).call(this);

(function() {
  var Config;

  Config = (function() {
    function Config($stateProvider, $urlRouterProvider) {
      $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/blankcontainer.html',
        controller: 'AppCtrl'
      }).state('app.search', {
        url: '/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html'
          }
        }
      }).state('app.browse', {
        url: '/browse',
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html'
          }
        }
      }).state('app.playlists', {
        url: '/playlists',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlists.html',
            controller: 'PlaylistsCtrl'
          }
        }
      }).state('app.single', {
        url: '/playlists/:playlistId',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl'
          }
        }
      }).state('app.home', {
        url: '/home',
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl as ctrl'
          }
        }
      });
      $urlRouterProvider.otherwise('/app/home');
    }

    return Config;

  })();

  angular.module('app').config(['$stateProvider', '$urlRouterProvider', Config]);

}).call(this);

(function() {
  var AppCtrl;

  AppCtrl = (function() {
    function AppCtrl($scope, $ionicModal, $timeout) {
      $scope.loginData = {};
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
      }).then(function(modal) {
        return $scope.modal = modal;
      });
      $scope.closeLogin = function() {
        return $scope.modal.hide();
      };
      $scope.login = function() {
        return $scope.modal.show();
      };
      $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);
        return $timeout(function() {
          return $scope.closeLogin();
        }, 1000);
      };
    }

    return AppCtrl;

  })();

  angular.module('app').controller('AppCtrl', ['$scope', '$ionicModal', '$timeout', AppCtrl]);

}).call(this);

(function() {
  var HomeCtrl;

  HomeCtrl = (function() {
    function HomeCtrl($scope) {
      this.$scope = $scope;
      console.log('home');
    }

    return HomeCtrl;

  })();

  angular.module('app').controller('HomeCtrl', ['$scope', HomeCtrl]);

}).call(this);

(function() {
  var PlaylistsCtrl;

  PlaylistsCtrl = (function() {
    function PlaylistsCtrl($scope) {
      $scope.playlists = [
        {
          title: 'Reggae',
          id: 1
        }, {
          title: 'Chill',
          id: 2
        }, {
          title: 'Dubstep',
          id: 3
        }, {
          title: 'Indie',
          id: 4
        }, {
          title: 'Rap',
          id: 5
        }, {
          title: 'Cowbell',
          id: 6
        }
      ];
    }

    return PlaylistsCtrl;

  })();

  angular.module('app').controller('PlaylistsCtrl', ['$scope', PlaylistsCtrl]);

}).call(this);

(function() {
  var PlaylistCtrl;

  PlaylistCtrl = (function() {
    function PlaylistCtrl($scope, $stateParams) {}

    return PlaylistCtrl;

  })();

  angular.module('app').controller('PlaylistCtrl', ['$scope', '$stateParams', PlaylistCtrl]);

}).call(this);
