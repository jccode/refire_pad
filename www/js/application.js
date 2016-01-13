(function() {
  angular.module('app', ['ionic', 'ngCookies', 'ksSwiper', 'ngCordova', 'ngResource', 'ngStorage', 'gettext', 'base64']);

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
  angular.module('app').constant({
    'userRoles': {
      user: 'user',
      driver: 'driver',
      admin: 'admin'
    },
    'event': {
      REQUIRE_LOGIN: 'require_login',
      LOGIN: 'login',
      LOGOUT: 'logout',
      SIGNUP: 'signup',
      ENTER_BUS: 'enter_bus',
      LEAVE_BUS: 'leave_bus'
    },
    'storageKey': {
      PAY_STEP_SEQNO: 'pay_step_seqno',
      PAY_BUS_LINE: 'pay_bus_line',
      TICKETS: 'tickets',
      SIGNUP_USER: 'signup_user',
      LAST_POSITION: 'last_position',
      SETTING_REFRESH_RATE: 'setting_refresh_rate',
      BUS: 'bus',
      BEACON_LAST_TS: 'beacon_last_ts'
    }
  });

}).call(this);

(function() {
  var I18N;

  I18N = (function() {
    function I18N(gettextCatalog) {
      gettextCatalog.setCurrentLanguage('zh');
    }

    return I18N;

  })();

  angular.module('app').run(['gettextCatalog', I18N]);

}).call(this);

(function() {
  var BeaconBootstrap, BeaconEventHandler, login, start;

  BeaconEventHandler = (function() {
    function BeaconEventHandler(beaconManager, beaconState) {
      this.beaconManager = beaconManager;
      this.beaconState = beaconState;
      this.notified = false;
      this.throttleRange = _.throttle((function(_this) {
        return function(result) {
          return _this.rangeRegion(result);
        };
      })(this), 5000);
    }

    BeaconEventHandler.prototype.didStartMonitoringForRegion = function(event, pluginResult) {
      console.log("[Start monitoring for region] " + event);
      return console.log("[Start monitoring for region] " + JSON.stringify(pluginResult));
    };

    BeaconEventHandler.prototype.didDetermineStateForRegion = function(event, pluginResult) {
      console.log("[Determine state for region] " + event);
      console.log("[Determine state for region] " + JSON.stringify(pluginResult));
      if (pluginResult['state'] === 'CLRegionStateInside') {
        return this.enterRegion(pluginResult.region);
      } else if (pluginResult['state'] === 'CLRegionStateOutside') {
        return this.exitRegion(pluginResult.region);
      }
    };

    BeaconEventHandler.prototype.didRangeBeaconsInRegion = function(event, pluginResult) {
      console.log(".");
      return this.throttleRange(pluginResult);
    };

    BeaconEventHandler.prototype.didEnterRegion = function(event, pluginResult) {
      console.log("[Enter region] " + event);
      console.log("[Enter region] " + JSON.stringify(pluginResult));
      return this.enterRegion(pluginResult.region);
    };

    BeaconEventHandler.prototype.didExitRegion = function(event, pluginResult) {
      console.log("[Exit region] " + event);
      console.log("[Exit region] " + JSON.stringify(pluginResult));
      return this.exitRegion(pluginResult.region);
    };

    BeaconEventHandler.prototype.enterRegion = function(region) {
      var buses;
      buses = this.beaconManager.find_bus(region.identifier, region.uuid, region.major, region.minor);
      if (buses && buses.length > 0) {
        console.log('enter bus');
        return this.beaconState.enter_bus(buses[0]);
      }
    };

    BeaconEventHandler.prototype.exitRegion = function(region) {
      var buses;
      buses = this.beaconManager.find_bus(region.identifier, region.uuid, region.major, region.minor);
      if (buses && buses.length > 0) {
        return this.beaconState.leave_bus(buses[0]);
      }
    };

    BeaconEventHandler.prototype.rangeRegion = function(result) {
      var bus, buses, region;
      region = result.region;
      buses = this.beaconManager.find_bus(region.identifier, region.uuid, region.major, region.minor);
      if (buses && buses.length > 0) {
        bus = buses[0];
        if (this.beaconState.is_on_bus(bus)) {
          return this.beaconState.on_bus(bus);
        } else {
          return this.beaconState.enter_bus(bus);
        }
      }
    };

    return BeaconEventHandler;

  })();

  BeaconBootstrap = (function() {
    function BeaconBootstrap($rootScope1, $cordovaBeacon1, $cordovaToast1, $cordovaLocalNotification1, gettextCatalog1, event1, Beacons1, beaconManager, beaconState) {
      this.$rootScope = $rootScope1;
      this.$cordovaBeacon = $cordovaBeacon1;
      this.$cordovaToast = $cordovaToast1;
      this.$cordovaLocalNotification = $cordovaLocalNotification1;
      this.gettextCatalog = gettextCatalog1;
      this.event = event1;
      this.Beacons = Beacons1;
      this.beaconManager = beaconManager;
      this.beaconState = beaconState;
      this.isAndroid = ionic.Platform.isAndroid();
      console.log("beacon bootstrap. isAndroid? " + this.isAndroid);
      this.check_bluetooth();
      this.beaconState.load_state();
    }

    BeaconBootstrap.prototype.check_bluetooth = function() {
      var e, error;
      try {
        return this.$cordovaBeacon.isBluetoothEnabled().then((function(_this) {
          return function(ret) {
            console.log("bluetooth enabled? " + ret + " ");
            if (!ret && _this.isAndroid) {
              _this.$cordovaBeacon.enableBluetooth();
            }
            _this.init_beacons();
            _this.add_beacon_event_handler();
            return _this.add_bus_event_handler();
          };
        })(this), (function(_this) {
          return function(err) {
            console.log("detect bluetooth failed. " + (JSON.stringifty(err)));
            return _this.toast("detect bluetooth failed. " + (JSON.stringifty(err)));
          };
        })(this));
      } catch (error) {
        e = error;
        return console.log(e);
      }
    };

    BeaconBootstrap.prototype.init_beacons = function() {
      console.log('init beacons');
      this.Beacons.all().$promise.then((function(_this) {
        return function(beacons) {
          var brNotifyEntryStateOnDisplay, bs;
          console.log(JSON.stringify(beacons));
          _this.beaconManager.init_beacon_models(beacons);
          bs = _.map(beacons, function(b) {
            return {
              'identifier': b.identifier,
              'uuid': b.uuid
            };
          });
          bs = _.uniq(bs, function(b) {
            return b.identifier + b.uuid;
          });
          console.log(JSON.stringify(bs));
          brNotifyEntryStateOnDisplay = true;
          _this.beacon_regions = _.map(beacons, function(b) {
            return _this.$cordovaBeacon.createBeaconRegion(b.identifier, b.uuid, null, null, brNotifyEntryStateOnDisplay);
          });
          return _.each(_this.beacon_regions, function(r) {
            _this.$cordovaBeacon.startMonitoringForRegion(r);
            return _this.$cordovaBeacon.startRangingBeaconsInRegion(r);
          });
        };
      })(this));
      return this.beaconEventHandler = new BeaconEventHandler(this.beaconManager, this.beaconState);
    };

    BeaconBootstrap.prototype.add_beacon_event_handler = function() {
      this.$rootScope.$on("$cordovaBeacon:didStartMonitoringForRegion", this.beaconEventHandler.didStartMonitoringForRegion.bind(this.beaconEventHandler));
      this.$rootScope.$on("$cordovaBeacon:didDetermineStateForRegion", this.beaconEventHandler.didDetermineStateForRegion.bind(this.beaconEventHandler));
      this.$rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", this.beaconEventHandler.didRangeBeaconsInRegion.bind(this.beaconEventHandler));
      this.$rootScope.$on("$cordovaBeacon:didEnterRegion", this.beaconEventHandler.didEnterRegion.bind(this.beaconEventHandler));
      return this.$rootScope.$on("$cordovaBeacon:didExitRegion", this.beaconEventHandler.didExitRegion.bind(this.beaconEventHandler));
    };

    BeaconBootstrap.prototype.add_bus_event_handler = function() {
      this.$rootScope.$on(this.event.ENTER_BUS, (function(_this) {
        return function(bus) {
          return _this.$cordovaLocalNotification.schedule({
            id: 1,
            title: _this.gettextCatalog.getString('Welcome'),
            text: _this.gettextCatalog.getString('Thanks for riding with us!')
          });
        };
      })(this));
      return this.$rootScope.$on(this.event.LEAVE_BUS, (function(_this) {
        return function(bus) {
          return _this.$cordovaLocalNotification.schedule({
            id: 2,
            title: _this.gettextCatalog.getString('Goodbye'),
            text: _this.gettextCatalog.getString('Hoping to see you again!')
          });
        };
      })(this));
    };

    BeaconBootstrap.prototype.toast = function(msg) {
      return this.$cordovaToast.show(msg, "short", "bottom");
    };

    return BeaconBootstrap;

  })();

  login = function(Auth) {
    var u;
    u = {
      username: 'pad',
      password: 'pad'
    };
    return Auth.login(u, function(user) {
      return user;
    }, function(err) {
      return console.log(err);
    });
  };

  start = function($rootScope, $ionicPlatform, $cordovaBeacon, $cordovaToast, $cordovaLocalNotification, gettextCatalog, event, Beacons, BeaconManager, BeaconState, Auth) {
    if (!Auth.isLoggedIn()) {
      login(Auth);
    }
    return $ionicPlatform.ready(function() {
      BeaconState.load_state();
      return console.log($rootScope.bus);
    });
  };

  angular.module('app').run(['$rootScope', '$ionicPlatform', '$cordovaBeacon', '$cordovaToast', '$cordovaLocalNotification', 'gettextCatalog', 'event', 'Beacons', 'BeaconManager', 'BeaconState', 'Auth', start]);

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
            templateUrl: 'templates/search.html',
            controller: 'SearchCtrl as ctrl'
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
      }).state('app.energy2', {
        url: '/energy2',
        views: {
          'menuContent': {
            templateUrl: 'templates/energy3.html'
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
  angular.module('app').constant({
    'settings': {
      baseurl: 'http://112.74.93.116',
      apiurl: 'http://112.74.93.116/api'
    }
  });

}).call(this);

(function() {
  var Ajax;

  Ajax = (function() {
    function Ajax($httpProvider, $resourceProvider) {
      var serialize;
      serialize = function(obj) {
        return Object.keys(obj).reduce(function(a, k) {
          a.push(k + '=' + encodeURIComponent(obj[k]));
          return a;
        }, []).join('&');
      };
      $httpProvider.defaults.withCredentials = true;
      $httpProvider.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest";
      $resourceProvider.defaults.stripTrailingSlashes = false;
    }

    return Ajax;

  })();

  angular.module('app').config(['$httpProvider', '$resourceProvider', Ajax]);

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
  var EnergyFlowCtrl;

  EnergyFlowCtrl = (function() {
    function EnergyFlowCtrl($scope, $rootScope, BusData, auth, event1) {
      this.$scope = $scope;
      this.$rootScope = $rootScope;
      this.BusData = BusData;
      this.auth = auth;
      this.event = event1;
      this.bus = this.$rootScope.bus;
      this.img_base_url = "img/engineflow/";
      if (this.bus && this.bus.bid && this.auth.isLoggedIn()) {
        this.demodata = false;
        this.getdata();
      } else {
        this.demodata = true;
        this.fallback_init();
        this.$scope.popup_login = (function(_this) {
          return function() {
            return _this.$rootScope.$broadcast(_this.event.REQUIRE_LOGIN, '');
          };
        })(this);
      }
      this.$rootScope.$on(this.event.ENTER_BUS, (function(_this) {
        return function(event, bus) {
          console.log('energy flow, enter bus');
          _this.bus = bus;
          return _this.getdata();
        };
      })(this));
      this.$rootScope.$on(this.event.LEAVE_BUS, (function(_this) {
        return function(event, bus) {
          console.log('energy flow, leave bus');
          _this.bus = null;
          return _this.fallback_init();
        };
      })(this));
    }

    EnergyFlowCtrl.prototype.getdata = function() {
      return this.BusData.busdata(this.bus.bid).then((function(_this) {
        return function(ret) {
          _this.data = ret.data;
          return _this.init_data();
        };
      })(this), (function(_this) {
        return function() {
          return _this.fallback_init();
        };
      })(this));
    };

    EnergyFlowCtrl.prototype.init_data = function() {
      this.$scope.gif_src = this.get_energy_flow_gif(this.data.BusData.status);
      this.$scope.fuel_cell_src = this.get_fuel_cell_img(this.data.GasData.remain);
      return this.$scope.battery_src = this.get_battery_img(this.data.PowerBatteryData.remain);
    };

    EnergyFlowCtrl.prototype.fallback_init = function() {
      this.$scope.gif_src = this.get_energy_flow_gif(null);
      this.$scope.fuel_cell_src = this.get_fuel_cell_img(null);
      return this.$scope.battery_src = this.get_battery_img(null);
    };

    EnergyFlowCtrl.prototype._get_energy_flow_gif = function(status) {
      var img;
      img = (function() {
        switch (status) {
          case 0:
            return "GIF-1044-E-only.gif";
          case 1:
            return "GIF-1044-E-only.gif";
          case 2:
            return "GIF-1044-H-and-E.gif";
          case 3:
            return "GIF-1044-H-to-E-and-engine.gif";
          case 4:
            return "GIF-1044-Engine-to-E.gif";
          default:
            return "GIF-1044-H-and-E.gif";
        }
      })();
      return this.img_base_url + img;
    };

    EnergyFlowCtrl.prototype.get_energy_flow_gif = function(status) {
      var img;
      img = (function() {
        switch (status) {
          case 0:
            return "LOGO-still.png";
          case 1:
            return "LOGO-E-only.gif";
          case 2:
            return "LOGO-H-and-E.gif";
          case 3:
            return "LOGO-H-to-E.gif";
          case 4:
            return "LOGO-Engine-to-E.gif";
          default:
            return "LOGO-E-only.gif";
        }
      })();
      return this.img_base_url + img;
    };

    EnergyFlowCtrl.prototype.get_fuel_cell_img = function(remain) {
      var img;
      img = (function() {
        switch (false) {
          case !(remain >= 100):
            return "battery-h-100.png";
          case !(remain >= 90):
            return "battery-h-90.png";
          case !(remain >= 80):
            return "battery-h-80.png";
          case !(remain >= 70):
            return "battery-h-70.png";
          case !(remain >= 60):
            return "battery-h-60.png";
          case !(remain >= 50):
            return "battery-h-50.png";
          case !(remain >= 40):
            return "battery-h-40.png";
          case !(remain >= 30):
            return "battery-h-30.png";
          case !(remain >= 20):
            return "battery-h-20.png";
          case !(remain >= 10):
            return "battery-h-10.png";
          default:
            return "battery-h-0.png";
        }
      })();
      return this.img_base_url + img;
    };

    EnergyFlowCtrl.prototype.get_battery_img = function(remain) {
      var img;
      img = (function() {
        switch (false) {
          case !(remain >= 100):
            return "battery-e-100.png";
          case !(remain >= 90):
            return "battery-e-90.png";
          case !(remain >= 80):
            return "battery-e-80.png";
          case !(remain >= 70):
            return "battery-e-70.png";
          case !(remain >= 60):
            return "battery-e-60.png";
          case !(remain >= 50):
            return "battery-e-50.png";
          case !(remain >= 40):
            return "battery-e-40.png";
          case !(remain >= 30):
            return "battery-e-30.png";
          case !(remain >= 20):
            return "battery-e-20.png";
          case !(remain >= 10):
            return "battery-e-10.png";
          default:
            return "battery-e-0.png";
        }
      })();
      return this.img_base_url + img;
    };

    return EnergyFlowCtrl;

  })();

  angular.module('app').controller('EnergyFlowCtrl', ['$scope', '$rootScope', 'BusData', 'Auth', 'event', EnergyFlowCtrl]);

}).call(this);

(function() {
  var EnergyFlowCtrl;

  EnergyFlowCtrl = (function() {
    function EnergyFlowCtrl($scope, $rootScope, $interval, BusData, auth, event1) {
      var self;
      this.$scope = $scope;
      this.$rootScope = $rootScope;
      this.$interval = $interval;
      this.BusData = BusData;
      this.auth = auth;
      this.event = event1;
      this.bus = this.$rootScope.bus;
      console.log("Energy flow");
      console.log(JSON.stringify(this.bus));
      this.img_base_url = "img/engineflow/";
      if (this.bus && this.bus.bid && this.auth.isLoggedIn()) {
        this.demodata = false;
        this.getdata();
      } else {
        this.demodata = true;
        this.fallback_init();
        this.$scope.popup_login = (function(_this) {
          return function() {
            return _this.$rootScope.$broadcast(_this.event.REQUIRE_LOGIN, '');
          };
        })(this);
      }
      this.$rootScope.$on(this.event.ENTER_BUS, (function(_this) {
        return function(event, bus) {
          console.log('energy flow, enter bus');
          _this.bus = bus;
          return _this.getdata();
        };
      })(this));
      this.$rootScope.$on(this.event.LEAVE_BUS, (function(_this) {
        return function(event, bus) {
          console.log('energy flow, leave bus');
          _this.bus = null;
          return _this.fallback_init();
        };
      })(this));
      self = this;
      this.$scope.$on("activeChanged", (function(_this) {
        return function(event, active) {
          console.log('active changed');
          if (active === 2) {
            console.log('getdata');
            self.getdata.apply(self);
            return self.auto_refresh.apply(self);
          } else {
            if (self.refresh_timer) {
              return self.$interval.cancel(self.refresh_timer);
            }
          }
        };
      })(this));
    }

    EnergyFlowCtrl.prototype.auto_refresh = function() {
      return this.refresh_timer = this.$interval((function(_this) {
        return function() {
          console.log('refresh.');
          return _this.getdata();
        };
      })(this), 1500);
    };

    EnergyFlowCtrl.prototype.getdata = function() {
      return this.BusData.busdata(this.bus.bid).then((function(_this) {
        return function(ret) {
          _this.data = ret.data;
          return _this.init_data();
        };
      })(this), (function(_this) {
        return function() {
          return _this.fallback_init();
        };
      })(this));
    };

    EnergyFlowCtrl.prototype.init_data = function() {
      this.$scope.gif_src = this.get_energy_flow_gif(this.data.BusData.status);
      this.$scope.fuel_cell_src = this.get_fuel_cell_img(this.data.GasData.remain);
      return this.$scope.battery_src = this.get_battery_img(this.data.PowerBatteryData.remain);
    };

    EnergyFlowCtrl.prototype.fallback_init = function() {
      this.$scope.gif_src = this.get_energy_flow_gif(null);
      this.$scope.fuel_cell_src = this.get_fuel_cell_img(null);
      return this.$scope.battery_src = this.get_battery_img(null);
    };

    EnergyFlowCtrl.prototype.get_energy_flow_gif = function(status) {
      var img;
      img = (function() {
        switch (status) {
          case 0:
            return "bottom-still.png";
          case 1:
            return "E-only-with-bottom.gif";
          case 2:
            return "H-and-E-with-bottom.gif";
          case 3:
            return "H-to-E-and-engine-with-bottom.gif";
          case 4:
            return "Engine-to-E-with-bottom.gif";
          default:
            return "E-only-with-bottom.gif";
        }
      })();
      return this.img_base_url + "wide/" + img;
    };

    EnergyFlowCtrl.prototype.get_fuel_cell_img = function(remain) {
      var img;
      img = (function() {
        switch (false) {
          case !(remain >= 100):
            return "battery-h-100.png";
          case !(remain >= 90):
            return "battery-h-90.png";
          case !(remain >= 80):
            return "battery-h-80.png";
          case !(remain >= 70):
            return "battery-h-70.png";
          case !(remain >= 60):
            return "battery-h-60.png";
          case !(remain >= 50):
            return "battery-h-50.png";
          case !(remain >= 40):
            return "battery-h-40.png";
          case !(remain >= 30):
            return "battery-h-30.png";
          case !(remain >= 20):
            return "battery-h-20.png";
          case !(remain >= 10):
            return "battery-h-10.png";
          default:
            return "battery-h-0.png";
        }
      })();
      return this.img_base_url + img;
    };

    EnergyFlowCtrl.prototype.get_battery_img = function(remain) {
      var img;
      img = (function() {
        switch (false) {
          case !(remain >= 100):
            return "battery-e-100.png";
          case !(remain >= 90):
            return "battery-e-90.png";
          case !(remain >= 80):
            return "battery-e-80.png";
          case !(remain >= 70):
            return "battery-e-70.png";
          case !(remain >= 60):
            return "battery-e-60.png";
          case !(remain >= 50):
            return "battery-e-50.png";
          case !(remain >= 40):
            return "battery-e-40.png";
          case !(remain >= 30):
            return "battery-e-30.png";
          case !(remain >= 20):
            return "battery-e-20.png";
          case !(remain >= 10):
            return "battery-e-10.png";
          default:
            return "battery-e-0.png";
        }
      })();
      return this.img_base_url + img;
    };

    return EnergyFlowCtrl;

  })();

  angular.module('app').controller('EnergyFlowCtrl3', ['$scope', '$rootScope', '$interval', 'BusData', 'Auth', 'event', EnergyFlowCtrl]);

}).call(this);

(function() {
  var HomeCtrl;

  HomeCtrl = (function() {
    function HomeCtrl($rootScope, $scope, $timeout, $window) {
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this.$timeout = $timeout;
      this.$window = $window;
      this.DELAY = 10;
      this.active = 0;
      this.video1 = document.getElementById("video1");
      this.video2 = document.getElementById("video2");
      this.video3 = document.getElementById("video3");
      this.sections = document.getElementsByClassName("section");
      this.video1.addEventListener('ended', this.video_end_listener.bind(this), false);
      this.video2.addEventListener('ended', this.video_end_listener.bind(this), false);
      this.video3.addEventListener('ended', this.video_end_listener.bind(this), false);
      this.active_handler(this.active);
    }

    HomeCtrl.prototype.video_end_listener = function() {
      return this.incr_active();
    };

    HomeCtrl.prototype.incr_active = function() {
      this.active = (this.active + 1) % 6;
      this.$scope.$apply();
      this.active_handler(this.active);
      return this.$scope.$broadcast('activeChanged', this.active);
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
          return this.play_video(this.video3);
        case 4:
          return this.delay_and_next();
        case 5:
          return this.delay_and_next();
        default:
          return console.log('fuck. Should not in here.');
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

  angular.module('app').controller('HomeCtrl', ['$rootScope', '$scope', '$timeout', '$window', HomeCtrl]);

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
  var SearchCtrl;

  SearchCtrl = (function() {
    function SearchCtrl($scope, Beacons) {
      this.$scope = $scope;
      this.Beacons = Beacons;
      console.log("search ctrl");
    }

    SearchCtrl.prototype.beaconlist = function() {
      return this.Beacons.all().$promise.then(function(beacons) {
        console.log(JSON.stringify(beacons));
        return console.log(beacons.length);
      }, function(e) {
        return console.log(JSON.stringify(e));
      });
    };

    return SearchCtrl;

  })();

  angular.module('app').controller('SearchCtrl', ['$scope', 'Beacons', SearchCtrl]);

}).call(this);

(function() {
  var TreeCtrl;

  TreeCtrl = (function() {
    function TreeCtrl($scope, $rootScope, $timeout, BusData, auth, event1) {
      this.$scope = $scope;
      this.$rootScope = $rootScope;
      this.$timeout = $timeout;
      this.BusData = BusData;
      this.auth = auth;
      this.event = event1;
      this.bus = this.$rootScope.bus;
      this.BASE = 100;
      this.init();
      if (this.bus && this.bus.bid && this.auth.isLoggedIn()) {
        this.getdata();
      }
      this.$rootScope.$on("activeChanged", (function(_this) {
        return function(event, active) {
          if (active === 4) {
            return _this.init();
          }
        };
      })(this));
      this.$rootScope.$on(this.event.ENTER_BUS, (function(_this) {
        return function(event, bus) {
          _this.bus = bus;
          return _this.getdata();
        };
      })(this));
    }

    TreeCtrl.prototype.init = function() {
      var t;
      t = document.getElementById("tree");
      return this.$timeout(function() {
        return t.parentNode.style.width = t.clientWidth + "px";
      }, 10);
    };

    TreeCtrl.prototype.getdata = function() {
      return this.BusData.busdata(this.bus.bid).then((function(_this) {
        return function(ret) {
          var emission_reduction;
          _this.data = ret.data;
          emission_reduction = _this.data.EnergySavingData.emission_reduction;
          return _this.calc(emission_reduction);
        };
      })(this));
    };

    TreeCtrl.prototype.calc = function(emission_reduction) {
      this.$scope.tree = Math.floor(emission_reduction / this.BASE);
      this.$scope.percentage = emission_reduction % this.BASE;
      return this.set_percentage(this.$scope.percentage / this.BASE);
    };

    TreeCtrl.prototype.set_percentage = function(p) {
      var tree_h;
      tree_h = document.getElementById("tree").offsetHeight;
      return document.getElementById("bg").style.height = (tree_h * p) + "px";
    };

    return TreeCtrl;

  })();

  angular.module('app').controller('TreeCtrl', ['$scope', '$rootScope', '$timeout', 'BusData', 'Auth', 'event', TreeCtrl]);

}).call(this);

(function() {
  var Cover;

  Cover = (function() {
    function Cover($window, $document) {
      var link, sh0, sw0;
      sw0 = $window.screen.width;
      sh0 = $window.screen.height;
      link = function(scope, el, attrs) {
        var f0, s0, set_size, w0;
        s0 = JSON.parse(attrs.cover);
        w0 = parseInt(s0['width']);
        f0 = parseInt(s0['font-size']);
        set_size = function() {
          var factor, l;
          l = Math.min(sw0, sh0);
          factor = l / w0;
          return el.css({
            "font-size": f0 * factor + "px",
            "width": l + "px",
            "height": l + "px"
          });
        };
        return set_size();
      };
      return {
        restrict: 'AC',
        link: link
      };
    }

    return Cover;

  })();

  angular.module('app').directive('cover', ['$window', '$document', Cover]);

}).call(this);

(function() {
  var EfBattery;

  EfBattery = (function() {
    function EfBattery($window, $document) {
      var bw0, f0, flh0, flh_min, link, w0;
      w0 = 1800;
      bw0 = 290;
      f0 = 200;
      flh0 = 30;
      flh_min = 12;
      link = function(scope, el, attrs) {
        var main, set_width;
        main = el.parent()[0];
        set_width = function() {
          var factor;
          factor = main.clientWidth / w0;
          return el.css({
            "width": bw0 * factor + "px",
            "font-size": f0 * factor + "%",
            "line-height": Math.max(flh0 * factor, flh_min) + "px"
          });
        };
        set_width();
        return angular.element($window).bind('resize', function() {
          return set_width();
        });
      };
      return {
        restrict: 'A',
        link: link
      };
    }

    return EfBattery;

  })();

  angular.module('app').directive('efbattery', ['$window', '$document', EfBattery]);

}).call(this);

(function() {
  var ScaleFont;

  ScaleFont = (function() {
    function ScaleFont($window, $document) {
      var f0, link, w0;
      w0 = 1044;
      f0 = 30;
      link = function(scope, el, attrs) {
        var lineHeight, pare, scale, style0, width;
        pare = el.parent()[0];
        style0 = JSON.parse(attrs.scaleFont);
        width = parseInt(style0['width']);
        lineHeight = parseInt(style0['line-height']);
        scale = function() {
          var factor;
          factor = pare.clientWidth / w0;
          return el.css({
            "font-size": f0 * factor + "px",
            "line-height": lineHeight * factor + "px",
            "margin-left": -(width * factor) / 2 + "px"
          });
        };
        scale();
        return angular.element($window).bind('resize', function() {
          return scale();
        });
      };
      return {
        restrict: 'A',
        link: link
      };
    }

    return ScaleFont;

  })();

  angular.module('app').directive('scaleFont', ['$window', '$document', ScaleFont]);

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

(function() {
  var Config, CsrfInterceptor,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CsrfInterceptor = (function() {
    function CsrfInterceptor($cookies) {
      var allowMethods, cookieName, headerName;
      headerName = 'X-CSRFToken';
      cookieName = 'csrftoken';
      allowMethods = ['GET'];
      return {
        'request': function(request) {
          var ref;
          if (ref = request.method, indexOf.call(allowMethods, ref) < 0) {
            request.headers[headerName] = $cookies.get(cookieName);
          }
          return request;
        }
      };
    }

    return CsrfInterceptor;

  })();

  Config = (function() {
    function Config($httpProvider) {
      $httpProvider.interceptors.push(['$cookies', CsrfInterceptor]);
    }

    return Config;

  })();

  angular.module('app').config(['$httpProvider', Config]);

}).call(this);

(function() {
  var Config, Interceptor;

  Interceptor = (function() {
    function Interceptor($log, $rootScope, $q) {
      return {
        response: function(response) {
          $rootScope.$broadcast("success:" + response.status, response);
          return response;
        },
        responseError: function(response) {
          $rootScope.$broadcast("error:" + response.status, response);
          return $q.reject(response);
        }
      };
    }

    return Interceptor;

  })();

  Config = (function() {
    function Config($httpProvider) {
      $httpProvider.interceptors.push(['$log', '$rootScope', '$q', Interceptor]);
    }

    return Config;

  })();

  angular.module('app').config(['$httpProvider', Config]);

}).call(this);

(function() {
  var Auth,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Auth = (function() {
    function Auth($http, $rootScope, $localStorage, $base64, settings, event) {
      var $storage, anon_user, get_current_user, l, role_prefix, self, set_current_user;
      self = this;
      anon_user = {
        username: '',
        groups: [],
        token: ''
      };
      $storage = $localStorage.$default({
        user: anon_user
      });
      get_current_user = function() {
        if (!$rootScope.user) {
          $rootScope.user = $storage.user;
        }
        return $rootScope.user;
      };
      set_current_user = function(user) {
        $storage.user = user;
        $rootScope.user = user;
        self.user = user;
        return user;
      };
      role_prefix = 'ROLE_';
      l = role_prefix.length;
      this.user = get_current_user();
      this.authorize = (function(_this) {
        return function(role) {
          return indexOf.call(_this.user.groups, role) >= 0;
        };
      })(this);
      this.isLoggedIn = (function(_this) {
        return function(user) {
          user = user || _this.user;
          return user.username !== '';
        };
      })(this);
      this.login = (function(_this) {
        return function(user, success, error) {
          return $http.post(settings.baseurl + '/api-token-auth/', {
            username: user.username,
            password: user.password
          }, {
            headers: {
              Authorization: void 0
            }
          }).success(function(ret) {
            user.token = ret.token;
            return $http.get(settings.baseurl + '/userprofile/curruser/', {
              headers: {
                Authorization: 'Token ' + ret.token
              }
            }).success(function(user) {
              var persist_user;
              persist_user = {
                id: user.id,
                username: user.username,
                phone: user.phone,
                groups: user.groups,
                token: ret.token
              };
              set_current_user(persist_user);
              success(persist_user);
              return $rootScope.$broadcast(event.LOGIN, persist_user);
            }).error(error);
          }).error(error);
        };
      })(this);
      this.signup = (function(_this) {
        return function(user, success, error) {
          return $http.post(settings.baseurl + '/userprofile/signup/', user).success(function(user) {
            var persist_user;
            persist_user = {
              id: user.id,
              username: user.username,
              phone: user.username,
              groups: user.groups,
              token: user.token
            };
            set_current_user(persist_user);
            success(persist_user);
            return $rootScope.$broadcast(event.SIGNUP, persist_user);
          }).error(error);
        };
      })(this);
      this.logout = (function(_this) {
        return function() {
          set_current_user(anon_user);
          return $rootScope.$broadcast(event.LOGOUT);
        };
      })(this);
      return this;
    }

    return Auth;

  })();

  angular.module('app').factory('Auth', ['$http', '$rootScope', '$localStorage', '$base64', 'settings', 'event', Auth]);

}).call(this);

(function() {
  var BeaconCheckin;

  BeaconCheckin = (function() {
    function BeaconCheckin($rootScope, $http, settings) {
      this.$rootScope = $rootScope;
      this.$http = $http;
      this.settings = settings;
      this.url = this.settings.baseurl + "/beacon/checkin/";
      this.user = this.$rootScope.user;
      this.event = {
        ENTER: 0,
        LEAVE: 1,
        STAY: 2
      };
    }

    BeaconCheckin.prototype.checkin = function(bid, event) {
      var data;
      data = {
        uid: this.user.id,
        bid: bid,
        event: event,
        timestamp: new Date()
      };
      return this.$http.post(this.url, data);
    };

    return BeaconCheckin;

  })();

  angular.module("app").service('BeaconCheckin', ['$rootScope', '$http', 'settings', BeaconCheckin]);

}).call(this);

(function() {
  var BeaconManager, BeaconModel, BeaconState;

  BeaconState = (function() {
    function BeaconState($rootScope, $localStorage, event, $timeout, BeaconCheckin) {
      this.$rootScope = $rootScope;
      this.$localStorage = $localStorage;
      this.event = event;
      this.$timeout = $timeout;
      this.BeaconCheckin = BeaconCheckin;
    }

    BeaconState.prototype.enter_bus = function(bus) {
      if (!bus) {
        return;
      }
      console.log(' ---------- [BeaconState] ENTER BUS ---------- ');
      console.log(JSON.stringify(bus));
      if (this.$rootScope.bus && this.$rootScope.bus.bid === bus.bid) {
        return this.update_ts();
      } else {
        this.save_bus(bus);
        return this.$rootScope.$broadcast(this.event.ENTER_BUS, bus);
      }
    };

    BeaconState.prototype.leave_bus = function(bus) {
      return this.leaveTimer = this.$timeout((function(_this) {
        return function() {
          _this.save_bus(null);
          return _this.$rootScope.$broadcast(_this.event.LEAVE_BUS, bus);
        };
      })(this), 30 * 1000);
    };

    BeaconState.prototype.on_bus = function(bus) {
      if (this.leaveTimer) {
        this.$timeout.cancel(this.leaveTimer);
      }
      return this.update_ts();
    };

    BeaconState.prototype.save_bus = function(bus) {
      this.$rootScope.bus = bus;
      this.$localStorage.bus = bus;
      return this.update_ts();
    };

    BeaconState.prototype.update_ts = function() {
      var now;
      now = new Date();
      this.$rootScope.beacon_last_ts = now;
      return this.$localStorage.beacon_last_ts = now;
    };

    BeaconState.prototype.is_on_bus = function(bus) {
      if (this.$rootScope.bus) {
        return this.$rootScope.bus.bid.toString() === bus.bid.toString();
      } else {
        return false;
      }
    };

    BeaconState.prototype.load_state = function() {
      this.$localStorage.$default({
        bus: {
          bid: "1",
          plate_number: "粤E9527"
        }
      });
      this.$rootScope.bus = this.$localStorage.bus;
      return this.$rootScope.beacon_last_ts = this.$localStorage.beacon_last_ts;
    };

    return BeaconState;

  })();

  BeaconModel = (function() {
    function BeaconModel(identifier1, uuid1, major1, minor1, buses) {
      this.identifier = identifier1;
      this.uuid = uuid1;
      this.major = major1;
      this.minor = minor1;
      this.buses = buses;
    }

    return BeaconModel;

  })();

  BeaconManager = (function() {
    function BeaconManager() {}

    BeaconManager.prototype.init_beacon_models = function(data) {
      var d, i, len, results;
      this.beacon_models = [];
      results = [];
      for (i = 0, len = data.length; i < len; i++) {
        d = data[i];
        results.push(this.beacon_models.push(new BeaconModel(d.identifier, d.uuid, d.major, d.minor, d.stick_on)));
      }
      return results;
    };

    BeaconManager.prototype.find_bus = function(identifier, uuid, major, minor) {

      /*
      		major: Optional, maybe undefined
      		minor: Optional, maybe undefined
       */
      var predicator, ret;
      predicator = function(m) {
        var result;
        result = m.uuid.toUpperCase() === uuid.toUpperCase();
        if (identifier) {
          result = result && m.identifier === identifier;
        }
        if (major) {
          result = result && m.major.toString() === major.toString();
        }
        if (minor) {
          result = result && m.minor.toString() === minor.toString();
        }
        return result;
      };
      ret = _.filter(this.beacon_models, predicator);
      return ret && ret.length > 0 && ret[0].buses || null;
    };

    return BeaconManager;

  })();

  angular.module("app").service("BeaconState", ['$rootScope', '$localStorage', 'event', '$timeout', 'BeaconCheckin', BeaconState]);

  angular.module("app").service("BeaconManager", BeaconManager);

}).call(this);

(function() {
  var Beacons;

  Beacons = (function() {
    function Beacons($resource, settings) {
      this.$resource = $resource;
      this.settings = settings;
      this.url = this.settings.baseurl + '/api/beacon/:id/';
      this.beacon = this.$resource(this.url, null, {
        query: {
          method: 'GET',
          headers: {
            Authorization: void 0
          },
          isArray: true
        }
      });
    }

    Beacons.prototype.all = function() {
      return this.beacon.query();
    };

    return Beacons;

  })();

  angular.module('app').service('Beacons', ['$resource', 'settings', Beacons]);

}).call(this);

(function() {
  var BusData;

  BusData = (function() {
    function BusData($http, settings) {
      this.$http = $http;
      this.settings = settings;
      this.url = this.settings.baseurl + '/vehicle/busdata/';
    }

    BusData.prototype.busdata = function(bid) {
      return this.$http.get(this.url + bid + "/");
    };

    return BusData;

  })();

  angular.module('app').service('BusData', ['$http', 'settings', BusData]);

}).call(this);
