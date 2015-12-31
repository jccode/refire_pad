
class AppCtrl
	constructor: ($scope, $ionicModal, $timeout) ->
		$scope.loginData = {}
		$ionicModal.fromTemplateUrl('templates/login.html',
			scope: $scope
		).then (modal)->
			$scope.modal = modal

		$scope.closeLogin = ->
			$scope.modal.hide()

		$scope.login = ->
			$scope.modal.show()

		$scope.doLogin = ->
			console.log 'Doing login', $scope.loginData

			$timeout ->
				$scope.closeLogin()
			, 1000


angular.module('app').controller 'AppCtrl', ['$scope', '$ionicModal', '$timeout', AppCtrl]
