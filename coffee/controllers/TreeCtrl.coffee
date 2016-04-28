
class TreeCtrl
	constructor: (@$scope, @$rootScope, @$timeout, @BusData, @auth, @event)->
		@bus = @$rootScope.bus
		@BASE = 100				# base number
		
		@$scope.totalMileage = 0
		@$scope.tree = 0
		
		@init()
		if @bus and @bus.bid and @auth.isLoggedIn()
			@getdata()
			
		@$rootScope.$on "activeChanged", (event,active)=>
			if active is 4
				@init()

		@$rootScope.$on @event.ENTER_BUS, (event, bus)=>
			@bus = bus
			@getdata()

	set_width: ->
		if @waittimer
			@$timeout.cancel @waittimer
			
		t = document.getElementById("tree")
		p = t.parentNode
		# console.log "img width:#{t.clientWidth}, parent width:#{p.style.width}"
		if !t.style.width  or isNaN(parseInt(t.style.width))
			tw = parseInt t.clientWidth
			if tw <= 0
				@waittimer = @$timeout ()=>
					@set_width()
				, 10
			else
				p.style.width = tw + "px"
		

	init: ->
		# @$timeout ()->
		# 	t.parentNode.style.width = t.clientWidth + "px"
		# , 10
		@$timeout ()=>
			@set_width()
		, 10

	getdata: ()->
		@BusData.busdata @bus.bid
			.then (ret)=>
				@data = ret.data

				# emission_reduction = @data.EnergySavingData.emission_reduction
				# @calc emission_reduction
				# 
				# calculate emission reduction by mileage data
				@$scope.totalMileage = @data.MileageData.total
				emission_reduction = @mileageToEmissionReduction @$scope.totalMileage
				@calc emission_reduction

	# 100km 油耗 26L
	# 1L 汽油减排: 2.3kg 二氧化碳; 0.627kg 碳.
	mileageToEmissionReduction: (mileage)->
		(mileage / 100) * 26 * 0.627

	calc:(emission_reduction)->
		# console.log "reduction: #{emission_reduction}, base: #{@BASE}"
		@$scope.tree = Math.floor(emission_reduction / @BASE)
		@$scope.percentage = emission_reduction % @BASE
		@set_percentage (@$scope.percentage / @BASE)

	set_percentage: (p)->
		tree_h = document.getElementById("tree").offsetHeight
		document.getElementById("bg").style.height = (tree_h * p) + "px"
		

angular.module('app').controller 'TreeCtrl', [
	'$scope',
	'$rootScope',
	'$timeout',
	'BusData',
	'Auth',
	'event',
	TreeCtrl
]
