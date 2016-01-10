
class TreeCtrl
	constructor: (@$scope, @$rootScope, @$timeout, @BusData, @auth)->
		@bus = @$rootScope.bus
		@BASE = 100				# base number
		@init()
		if @bus and @bus.bid and @auth.isLoggedIn()
			@getdata()
		@$rootScope.$on "activeChanged", (event,active)=>
			if active is 4
				@init()

	init: ->
		t = document.getElementById("tree")
		@$timeout ()->
			t.parentNode.style.width = t.clientWidth + "px"
		, 10

	getdata: ()->
		@BusData.busdata @bus.bid
			.then (ret)=>
				@data = ret.data
				emission_reduction = @data.EnergySavingData.emission_reduction
				@calc emission_reduction

	calc:(emission_reduction)->
		#console.log "reduction: #{emission_reduction}, base: #{@BASE}"
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
	TreeCtrl
]
