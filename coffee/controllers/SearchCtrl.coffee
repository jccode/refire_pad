
class SearchCtrl
	constructor: (@$scope, @Beacons)->
		console.log "search ctrl"

	beaconlist: ()->
		@Beacons.all().$promise
			.then (beacons)->
				console.log(JSON.stringify(beacons))
				console.log beacons.length
			, (e)->
				console.log JSON.stringify e


angular.module('app').controller 'SearchCtrl', [
	'$scope',
	'Beacons'
	SearchCtrl
	]
