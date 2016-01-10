
class BeaconCheckin
	constructor: (@$rootScope, @$http, @settings)->
		@url = @settings.baseurl + "/beacon/checkin/"
		@user = @$rootScope.user
		@event =
			ENTER: 0
			LEAVE: 1
			STAY: 2

	checkin: (bid, event)->
		data =
			uid: @user.id
			bid: bid
			event: event
			timestamp: new Date()
		#console.log 'checkin: '+JSON.stringify(data)
		@$http.post @url, data


angular.module("app").service 'BeaconCheckin', [
	'$rootScope',
	'$http',
	'settings',
	BeaconCheckin
]
