
class Bootstrap
	constructor: ($ionicPlatform) ->
		$ionicPlatform.ready ->
			if window.cordova and window.cordova.plugins.Keyboard
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar true
				cordova.plugins.Keyboard.disableScroll true
			if window.StatusBar
				StatusBar.styleDefault()


angular.module('app').run ['$ionicPlatform', Bootstrap]
