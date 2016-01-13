

class BeaconEventHandler
	constructor: (@beaconManager, @beaconState)->
		@notified = false
		@throttleRange = _.throttle (result)=>
			@rangeRegion result
		, 5000

	didStartMonitoringForRegion: (event, pluginResult)->
		console.log "[Start monitoring for region] "+(event)
		console.log "[Start monitoring for region] "+JSON.stringify(pluginResult)
		# do nothing

	didDetermineStateForRegion: (event, pluginResult)->
		console.log "[Determine state for region] "+(event)
		console.log "[Determine state for region] "+JSON.stringify(pluginResult)
		if pluginResult['state'] is 'CLRegionStateInside'
			@enterRegion(pluginResult.region)
		else if pluginResult['state'] is 'CLRegionStateOutside'
			@exitRegion(pluginResult.region)

	didRangeBeaconsInRegion: (event, pluginResult)->
		#console.log "[Range beacons in region] "+(event)
		#console.log "[Range beacons in region] "+JSON.stringify(pluginResult)
		console.log "."
		@throttleRange pluginResult

	didEnterRegion: (event, pluginResult)->
		console.log "[Enter region] "+(event)
		console.log "[Enter region] "+JSON.stringify(pluginResult)
		@enterRegion(pluginResult.region)
		
	didExitRegion: (event, pluginResult)->
		console.log "[Exit region] "+(event)
		console.log "[Exit region] "+JSON.stringify(pluginResult)
		@exitRegion(pluginResult.region)

	enterRegion: (region)->
		buses = @beaconManager.find_bus(region.identifier, region.uuid, region.major, region.minor)
		if buses and buses.length > 0
			console.log 'enter bus'
			@beaconState.enter_bus(buses[0])

	exitRegion: (region)->
		buses = @beaconManager.find_bus(region.identifier, region.uuid, region.major, region.minor)
		if buses and buses.length > 0
			@beaconState.leave_bus(buses[0])

	rangeRegion: (result)->
		#console.log "---------- Ranging ----------"
		region = result.region
		# close_beacons = _.filter result.beacons, (b)-> b.proximity in ['ProximityImmediate', 'ProximityNear']
		# if close_beacons and close_beacons.length > 0
		# 	buses = _.map close_beacons, (b)=>
		# 		return @beaconManager.find_bus(b.identifier, b.uuid, b.major, b.minor)
		# 	buses = _.flatten buses
		# 	#console.log "buses:"+JSON.stringify(buses)
		# 	if buses and buses.length>0
		# 		bus = buses[0]
		# 		if @beaconState.is_on_bus(bus)
		# 			@beaconState.on_bus(bus)
		# 		else
		# 			@beaconState.enter_bus(bus)
		
		buses = @beaconManager.find_bus(region.identifier, region.uuid, region.major, region.minor)
		if buses and buses.length > 0
			bus  = buses[0]
			if @beaconState.is_on_bus(bus)
				@beaconState.on_bus(bus)
			else
				@beaconState.enter_bus(bus)


class BeaconBootstrap
	constructor: (@$rootScope, @$cordovaBeacon, @$cordovaToast, @$cordovaLocalNotification, @gettextCatalog, @event, @Beacons, @beaconManager, @beaconState)->
		@isAndroid = ionic.Platform.isAndroid()
		console.log "beacon bootstrap. isAndroid? #{@isAndroid}"
		@check_bluetooth()
		@beaconState.load_state()

	check_bluetooth: ->
		try
			@$cordovaBeacon.isBluetoothEnabled()
				.then (ret)=>
					console.log "bluetooth enabled? #{ret} "
					if not ret and @isAndroid
						@$cordovaBeacon.enableBluetooth()
					@init_beacons()
					@add_beacon_event_handler()
					@add_bus_event_handler()
				, (err)=>
					console.log "detect bluetooth failed. #{JSON.stringifty(err)}"
					@toast "detect bluetooth failed. #{JSON.stringifty(err)}"
		catch e
			console.log e
		

	init_beacons: ->
		console.log 'init beacons'
		@Beacons.all().$promise
			.then (beacons)=>
				console.log JSON.stringify beacons
				# beaconManager = new BeaconManager beacons
				@beaconManager.init_beacon_models beacons
				bs = _.map beacons, (b)-> {'identifier':b.identifier, 'uuid':b.uuid}
				bs = _.uniq bs, (b)->b.identifier+b.uuid
				console.log JSON.stringify bs
				brNotifyEntryStateOnDisplay = true
				@beacon_regions = _.map beacons, (b)=>
					@$cordovaBeacon.createBeaconRegion b.identifier, b.uuid, null, null, brNotifyEntryStateOnDisplay
				_.each @beacon_regions, (r)=>
					@$cordovaBeacon.startMonitoringForRegion(r)
					@$cordovaBeacon.startRangingBeaconsInRegion(r)

		# event handler
		@beaconEventHandler = new BeaconEventHandler @beaconManager, @beaconState

	add_beacon_event_handler: ->
		@$rootScope.$on "$cordovaBeacon:didStartMonitoringForRegion", @beaconEventHandler.didStartMonitoringForRegion.bind(@beaconEventHandler)
		@$rootScope.$on "$cordovaBeacon:didDetermineStateForRegion", @beaconEventHandler.didDetermineStateForRegion.bind(@beaconEventHandler)
		@$rootScope.$on "$cordovaBeacon:didRangeBeaconsInRegion", @beaconEventHandler.didRangeBeaconsInRegion.bind(@beaconEventHandler)
		@$rootScope.$on "$cordovaBeacon:didEnterRegion", @beaconEventHandler.didEnterRegion.bind(@beaconEventHandler)
		@$rootScope.$on "$cordovaBeacon:didExitRegion", @beaconEventHandler.didExitRegion.bind(@beaconEventHandler)

	add_bus_event_handler: ->
		@$rootScope.$on @event.ENTER_BUS, (bus)=>
			@$cordovaLocalNotification.schedule
				id: 1
				title: @gettextCatalog.getString('Welcome')
				text: @gettextCatalog.getString('Thanks for riding with us!')
		@$rootScope.$on @event.LEAVE_BUS, (bus)=>
			@$cordovaLocalNotification.schedule
				id: 2
				title: @gettextCatalog.getString('Goodbye')
				text: @gettextCatalog.getString('Hoping to see you again!')

	toast: (msg)->
		@$cordovaToast.show msg, "short", "bottom"



login = (Auth)->
	u =
		username: 'pad'
		password: 'pad'
	Auth.login u, (user)->
		user
	, (err)->
		console.log err
		


start = ($rootScope, $ionicPlatform, $cordovaBeacon, $cordovaToast, $cordovaLocalNotification, gettextCatalog, event, Beacons, BeaconManager, BeaconState, Auth)->
	if not Auth.isLoggedIn()
		login(Auth)
	$ionicPlatform.ready ->
		# try
		# 	new BeaconBootstrap $rootScope, $cordovaBeacon, $cordovaToast, $cordovaLocalNotification, gettextCatalog, event, Beacons, BeaconManager, BeaconState
		# catch e
		# 	console.log e
		
		# test
		BeaconState.load_state()
		console.log $rootScope.bus
		

angular.module('app').run [
	'$rootScope',
	'$ionicPlatform',
	'$cordovaBeacon',
	'$cordovaToast',
	'$cordovaLocalNotification',
	'gettextCatalog',
	'event',
	'Beacons',
	'BeaconManager',
	'BeaconState',
	'Auth'
	start
]
