
class EnergyFlowCtrl2
	constructor:($scope, $rootScope, $interval, BusData, auth, Event)->
		bus = $rootScope.bus
		img_base_url = "img/engineflow/"
		refresh_timer = null

		get_energy_flow_gif = (status)->
			img = switch status
				when 0 then "bottom-still.png" # TODO: need to correct, still
				when 1 then "E-only-with-bottom.gif"
				when 2 then "H-and-E-with-bottom.gif"
				when 3 then "H-to-E-and-engine-with-bottom.gif"
				when 4 then "Engine-to-E-with-bottom.gif"
				else "E-only-with-bottom.gif"
			img_base_url + "wide/" + img

		get_fuel_cell_img = (remain)->
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
			img_base_url + img

		get_battery_img = (remain)->
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
			img_base_url + img

		fallback_init = ->
			$scope.gif_src = get_energy_flow_gif null
			$scope.fuel_cell_src = get_fuel_cell_img null
			$scope.battery_src = get_battery_img null

		init_data = ->
			$scope.gif_src = get_energy_flow_gif $scope.data.BusData.status
			$scope.fuel_cell_src = get_fuel_cell_img $scope.data.GasData.remain
			$scope.battery_src = get_battery_img $scope.data.PowerBatteryData.remain

		getdata = ->
			BusData.busdata $rootScope.bus.bid
				.then (ret)=>
					$scope.data = ret.data
					init_data()
				, ()=>
					fallback_init()

		init =->
			if bus and bus.bid and auth.isLoggedIn()
				@demodata = false
				getdata()
			else
				@demodata = true

		auto_refresh = ()->
			refresh_timer = $interval ()->
				console.log 'refresh.'
				getdata()
			, 1500

		event = ->
			$rootScope.$on Event.ENTER_BUS, (event, bus_)=>
				console.log 'energy flow, enter bus'
				bus = bus_
				getdata()

			$rootScope.$on Event.LEAVE_BUS, (event, bus_)=>
				console.log 'energy flow, leave bus'
				bus = null
				fallback_init()

			$scope.$on "activeChanged", (event,active)=>
				console.log 'active changed'
				if active is 2
					console.log 'getdata'
					console.log event
					getdata()
					auto_refresh()
				else
					if refresh_timer
						$interval.cancel refresh_timer

		init()
		event()
		


class EnergyFlowCtrl
	constructor: (@$scope, @$rootScope, @$interval, @BusData, @auth, @event)->
		@bus = @$rootScope.bus
		console.log "Energy flow"
		console.log JSON.stringify @bus
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

		self = this
		@$scope.$on "activeChanged", (event,active)=>
			console.log 'active changed'
			if active is 2
				console.log 'getdata'
				console.log event
				self.getdata.apply(self)
				self.auto_refresh.apply(self)
			else
				if self.refresh_timer
					self.$interval.cancel self.refresh_timer

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
	EnergyFlowCtrl2
]
