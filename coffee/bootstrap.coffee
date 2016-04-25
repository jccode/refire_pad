
class Bootstrap
	constructor: ($ionicPlatform, $http, $rootScope, auth, event) ->
		$ionicPlatform.ready ->
			if window.cordova and window.cordova.plugins.Keyboard
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar true
				cordova.plugins.Keyboard.disableScroll true
			if window.StatusBar
				StatusBar.styleDefault()
				
			# auto start in android
			if window.cordova and window.cordova.plugins.autoStart
				cordova.plugins.autoStart.enable()

		# authentication
		auth_header = (user)->
			$http.defaults.headers.common['Authorization'] = 'Token ' + user.token

		# $http.defaults.headers.common['Authorization'] = 'Token ' + auth.user.token
		auth_header auth.user

		# events
		# $rootScope.$on event.LOGIN, (event, user) =>
		# 	$http.defaults.headers.common['Authorization'] = 'Token ' + user.token

		$rootScope.$on event.LOGIN, (event, user) => auth_header user
		$rootScope.$on event.SIGNUP, (event, user) => auth_header user
		$rootScope.$on event.LOGOUT, (event) => $http.defaults.headers.common['Authorization'] = undefined


angular.module('app').run ['$ionicPlatform', '$http', '$rootScope', 'Auth', 'event', Bootstrap]
