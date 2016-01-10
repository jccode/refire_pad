
class Cover
	constructor: ($window, $document)->
		sw0 = $window.screen.width
		sh0 = $window.screen.height
			
		link = (scope, el, attrs)->
			s0 = JSON.parse attrs.cover
			w0 = parseInt s0['width']
			f0 = parseInt s0['font-size']
			set_size = ->
				l = Math.min(sw0, sh0)
				factor = l / w0
				el.css
					"font-size": f0 * factor + "px"
					"width": l + "px"
					"height": l + "px"
			set_size()
			
			# angular.element($window).bind 'resize', ->
			# 	set_size()
			
		return {
			restrict: 'AC'
			link: link
		}


angular.module('app').directive 'cover', [
	'$window',
	'$document',
	Cover
	]




