
class EnergyFlowCtrl
	constructor: (@$scope, @$rootScope, @BusData, @auth, @event)->
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

	_get_energy_flow_gif: (status)->
		img = switch status
			when 0 then "GIF-1044-E-only.gif" # TODO: need correct
			when 1 then "GIF-1044-E-only.gif"
			when 2 then "GIF-1044-H-and-E.gif"
			when 3 then "GIF-1044-H-to-E-and-engine.gif"
			when 4 then "GIF-1044-Engine-to-E.gif"
			else "GIF-1044-H-and-E.gif"
		@img_base_url + img

	get_energy_flow_gif: (status)->
		img = switch status
			when 0 then "LOGO-still.png"
			when 1 then "LOGO-E-only.gif"
			when 2 then "LOGO-H-and-E.gif"
			when 3 then "LOGO-H-to-E.gif"
			when 4 then "LOGO-Engine-to-E.gif"
			else "LOGO-E-only.gif"
		@img_base_url + img

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


angular.module('app').controller 'EnergyFlowCtrl', [
	'$scope',
	'$rootScope',
	'BusData',
	'Auth',
	'event',
	EnergyFlowCtrl
]
