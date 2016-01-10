

class BeaconState
	constructor: (@$rootScope, @$localStorage, @event, @$timeout, @BeaconCheckin)->

	enter_bus: (bus)->
		if not bus
			return
			
		console.log ' ---------- [BeaconState] ENTER BUS ---------- '
		console.log JSON.stringify bus
		if @$rootScope.bus and @$rootScope.bus.bid is bus.bid
			@update_ts()
		else
			@save_bus bus
			#@BeaconCheckin.checkin bus.bid, @BeaconCheckin.event.ENTER
			@$rootScope.$broadcast @event.ENTER_BUS, bus

	leave_bus: (bus)->
		@leaveTimer = @$timeout ()=>
			# leave
			@save_bus null
			#@BeaconCheckin.checkin bus.bid, @BeaconCheckin.event.LEAVE
			@$rootScope.$broadcast @event.LEAVE_BUS, bus
		, 30*1000

	on_bus: (bus)->
		# clear leaveTimer if needed, checkin on server
		if @leaveTimer
			@$timeout.cancel @leaveTimer
		#console.log '---------- ON BUS ----------'
		@update_ts()
		# @BeaconCheckin.checkin bus.bid, @BeaconCheckin.event.STAY

	save_bus: (bus)->
		@$rootScope.bus = bus
		@$localStorage.bus = bus
		@update_ts()

	update_ts: ()->
		now = new Date()
		@$rootScope.beacon_last_ts = now
		@$localStorage.beacon_last_ts = now

	is_on_bus: (bus)->
		#return @$rootScope.bus and @$rootScope.bus.bid == bus.bid
		if @$rootScope.bus
			@$rootScope.bus.bid.toString() is bus.bid.toString()
		else
			false

	load_state: ()->
		# default bus for testing
		# @$localStorage.$default
		# 	bus:
		# 		bid: "9527"
		# 		plate_number: "粤E9527"
		
		@$rootScope.bus = @$localStorage.bus
		@$rootScope.beacon_last_ts = @$localStorage.beacon_last_ts
		

class BeaconModel
	constructor: (@identifier, @uuid, @major, @minor, @buses)->

		
class BeaconManager
	constructor: ()->
		

	init_beacon_models: (data)->
		@beacon_models = []
		@beacon_models.push new BeaconModel(d.identifier, d.uuid, d.major, d.minor, d.stick_on) for d in data

	find_bus: (identifier, uuid, major, minor)->
		###
		major: Optional, maybe undefined
		minor: Optional, maybe undefined
		###
		predicator = (m)->
			result = m.uuid.toUpperCase() is uuid.toUpperCase()
			if identifier
				result = result and m.identifier is identifier
			if major
				result = result and m.major.toString() is major.toString()
			if minor
				result = result and m.minor.toString() is minor.toString()
			result
			
		ret = _.filter @beacon_models, predicator
		
		#console.log 'find_bus result'
		# console.log JSON.stringify(@beacon_models)
		# console.log identifier+";"+uuid+";"+major+";"+minor
		#console.log ret
		
		ret and ret.length>0 and ret[0].buses || null


#window.BeaconManager = BeaconManager

angular.module("app").service "BeaconState", [
	'$rootScope',
	'$localStorage',
	'event',
	'$timeout',
	'BeaconCheckin',
	BeaconState
]

angular.module("app").service "BeaconManager", BeaconManager
