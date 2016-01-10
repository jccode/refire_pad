
class BusData
	constructor: (@$http, @settings)->
		@url = @settings.baseurl + '/vehicle/busdata/'

	busdata: (bid)->
		@$http.get @url+bid+"/"


angular.module('app').service 'BusData', [
	'$http',
	'settings',
	BusData
]
