
class EnergyFlowCtrl
	constructor: (@$scope, @$rootScope, @$interval, @BusData, @auth, @event)->
		@bus = @$rootScope.bus
		@img_base_url = "img/engineflow/"
		if @bus and @bus.bid and @auth.isLoggedIn()
			@demodata = false
			@getdata()
		else
			@demodata = true
			@fallback_init()
			@$scope.popup_login = ()=>
				@$rootScope.$broadcast @event.REQUIRE_LOGIN, ''

		@$rootScope.$on @event.ENTER_BUS, (event, bus)=>
			console.log 'energy flow, enter bus'
			@bus = bus
			@getdata()
			
		@$rootScope.$on @event.LEAVE_BUS, (event, bus)=>
			console.log 'energy flow, leave bus'
			@bus = null
			@fallback_init()

		@$rootScope.$on "activeChanged", (event,active)=>
			if active is 2
				console.log 'getdata'
				@getdata()
				@auto_refresh()
			else
				if @refresh_timer
					@$interval.cancel @refresh_timer

	auto_refresh: ()->
		@refresh_timer = @$interval ()=>
			console.log 'refresh.'
			@getdata()
		, 1500

	getdata: ->
		@BusData.busdata @bus.bid
			.then (ret)=>
				@data = ret.data
				@init_data()
			, ()=>
				@fallback_init()

	init_data:->
		@$scope.gif_src = @get_energy_flow_gif @data.BusData.status
		@$scope.fuel_cell_src = @get_fuel_cell_img @data.GasData.remain
		@$scope.battery_src = @get_battery_img @data.PowerBatteryData.remain

	fallback_init:->
		@$scope.gif_src = @get_energy_flow_gif null
		@$scope.fuel_cell_src = @get_fuel_cell_img null
		@$scope.battery_src = @get_battery_img null

	get_energy_flow_gif: (status)->
		img = switch status
			when 0 then "bottom-still.png" # TODO: need to correct, still
			when 1 then "E-only-with-bottom.gif"
			when 2 then "H-and-E-with-bottom.gif"
			when 3 then "H-to-E-and-engine-with-bottom.gif"
			when 4 then "Engine-to-E-with-bottom.gif"
			else "E-only-with-bottom.gif"
		@img_base_url + "wide/" + img

	get_fuel_cell_img: (remain)->
		img = switch
			when remain >= 100 then "battery-h-100.png"
			when remain >= 90 then "battery-h-90.png"
			when remain >= 80 then "battery-h-80.png"
			when remain >= 70 then "battery-h-70.png"
			when remain >= 60 then "battery-h-60.png"
			when remain >= 50 then "battery-h-50.png"
			when remain >= 40 then "battery-h-40.png"
			when remain >= 30 then "battery-h-30.png"
			when remain >= 20 then "battery-h-20.png"
			when remain >= 10 then "battery-h-10.png"
			else "battery-h-0.png"
		@img_base_url + img

	get_battery_img: (remain)->
		img = switch
			when remain >= 100 then "battery-e-100.png"
			when remain >= 90 then "battery-e-90.png"
			when remain >= 80 then "battery-e-80.png"
			when remain >= 70 then "battery-e-70.png"
			when remain >= 60 then "battery-e-60.png"
			when remain >= 50 then "battery-e-50.png"
			when remain >= 40 then "battery-e-40.png"
			when remain >= 30 then "battery-e-30.png"
			when remain >= 20 then "battery-e-20.png"
			when remain >= 10 then "battery-e-10.png"
			else "battery-e-0.png"
		@img_base_url + img


angular.module('app').controller 'EnergyFlowCtrl3', [
	'$scope',
	'$rootScope',
	'$interval',
	'BusData',
	'Auth',
	'event',
	EnergyFlowCtrl
]
