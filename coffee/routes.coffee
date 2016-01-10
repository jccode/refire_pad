
class Config
	constructor: ($stateProvider, $urlRouterProvider) ->
		$stateProvider
			.state 'app',
				url: '/app'
				abstract: true
				templateUrl: 'templates/blankcontainer.html' # menu.html
				controller: 'AppCtrl'
				
			.state 'app.search',
				url: '/search'
				views:
					'menuContent':
						templateUrl: 'templates/search.html'
						controller: 'SearchCtrl as ctrl'

			.state 'app.browse', 
				url: '/browse'
				views:
					'menuContent':
						templateUrl: 'templates/browse.html'

			.state 'app.playlists',
				url: '/playlists'
				views:
					'menuContent':
						templateUrl: 'templates/playlists.html'
						controller: 'PlaylistsCtrl'

			.state 'app.single', 
				url: '/playlists/:playlistId'
				views:
					'menuContent':
						templateUrl: 'templates/playlist.html'
						controller: 'PlaylistCtrl'

			.state 'app.home',
				url: '/home'
				views:
					'menuContent':
						templateUrl: 'templates/home.html'
						controller: 'HomeCtrl as ctrl'

			.state 'app.tree',
				url: '/tree'
				views:
					'menuContent':
						templateUrl: 'templates/tree.html'

			.state 'app.energy2',
				url: '/energy2'
				views:
					'menuContent':
						templateUrl: 'templates/energy2.html'



		$urlRouterProvider.otherwise '/app/home'
		#$urlRouterProvider.otherwise '/app/energy2'


angular.module('app').config ['$stateProvider', '$urlRouterProvider', Config]
