
class Beacons
	constructor: (@$resource, @settings)->
		@url = @settings.baseurl + '/api/beacon/:id/'
		@beacon = @$resource @url, null,
			query:
				method: 'GET'
				headers: { Authorization: undefined }
				isArray: true
		
	all: ->
		@beacon.query()


angular.module('app').service 'Beacons', [
	'$resource',
	'settings',
	Beacons
]
	
