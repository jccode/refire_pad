(function() {
  angular.module('app', ['ionic', 'ksSwiper']);

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
      }).state('app.tree', {
        url: '/tree',
        views: {
          'menuContent': {
            templateUrl: 'templates/tree.html'
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
    function HomeCtrl($scope, $timeout) {
      this.$scope = $scope;
      this.$timeout = $timeout;
      this.DELAY = 10;
      this.active = 0;
      this.video1 = document.getElementById("video1");
      this.video2 = document.getElementById("video2");
      window.v1 = this.video1;
      window.v2 = this.video2;
      this.video1.addEventListener('ended', this.video_end_listener.bind(this), false);
      this.video2.addEventListener('ended', this.video_end_listener.bind(this), false);
      this.active_handler(this.active);
    }

    HomeCtrl.prototype.video_end_listener = function() {
      return this.incr_active();
    };

    HomeCtrl.prototype.incr_active = function() {
      this.active = (this.active + 1) % 5;
      this.$scope.$apply();
      return this.active_handler(this.active);
    };

    HomeCtrl.prototype.active_handler = function(idx) {
      switch (idx) {
        case 0:
          return this.play_video(this.video1);
        case 1:
          return this.play_video(this.video2);
        case 2:
          return this.delay_and_next();
        case 3:
          return this.delay_and_next();
        case 4:
          return this.delay_and_next();
        default:
          return console.log('fuck. Should not be in here.');
      }
    };

    HomeCtrl.prototype.delay_and_next = function() {
      return this.$timeout(this.incr_active.bind(this), this.DELAY * 1000);
    };

    HomeCtrl.prototype.play_video = function(video) {
      var err, error;
      try {
        this.video_full_screen(video);
      } catch (error) {
        err = error;
        console.log(err);
      }
      return video.play();
    };

    HomeCtrl.prototype.video_full_screen = function(elem) {
      if (elem.requestFullscreen) {
        return elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        return elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        return elem.webkitRequestFullscreen();
      } else {
        return console.log('fullscreen api not support');
      }
    };

    return HomeCtrl;

  })();

  angular.module('app').controller('HomeCtrl', ['$scope', '$timeout', HomeCtrl]);

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

(function() {
  var TrustedFilter;

  TrustedFilter = (function() {
    function TrustedFilter($sce) {
      return function(url) {
        return $sce.trustAsResourceUrl(url);
      };
    }

    return TrustedFilter;

  })();

  angular.module('app').filter('trusted', ['$sce', TrustedFilter]);

}).call(this);
