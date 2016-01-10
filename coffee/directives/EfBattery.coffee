
class EfBattery
	constructor: ($window, $document)->
		w0 = 1044				# width_0
		bw0 = 290				# battery_width_0
		f0 = 200				# font_size_0: 200%
		flh0 = 30				# font_line_height_0: 30px
		flh_min = 12

		link = (scope, el, attrs)->
			#console.log 'ef battery'
			main = el.parent()[0]
			# console.log main
			# console.log main.clientWidth

			set_width = ->
				factor = main.clientWidth / w0
				el.css
					"width": bw0 * factor + "px"
					"font-size": f0 * factor + "%"
					"line-height": Math.max(flh0 * factor, flh_min) + "px"

			set_width()

			angular.element($window).bind 'resize', ->
				# console.log 'resize'
				# console.log main.clientWidth
				set_width()
				
		return {
			restrict: 'A'
			link: link
		}


angular.module('app').directive 'efbattery', [
	'$window',
	'$document',
	EfBattery
	]
