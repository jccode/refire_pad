
class HomeCtrl
	constructor: (@$scope)->
		console.log 'home'



angular.module('app').controller 'HomeCtrl', ['$scope', HomeCtrl]
