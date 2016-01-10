class ScaleFont
	constructor: ($window, $document)->
		w0 = 1044				# width_0
		f0 = 30				# font_size_0: 200%

		link = (scope, el, attrs)->
			pare = el.parent()[0]
			style0 = JSON.parse attrs.scaleFont
			width = parseInt style0['width']
			lineHeight = parseInt style0['line-height']
			scale = ->
				factor = pare.clientWidth / w0
				el.css
					"font-size": f0 * factor + "px"
					"line-height": lineHeight * factor + "px"
					"margin-left": - (width * factor)/2 + "px"
			scale()
			
			angular.element($window).bind 'resize', ->
				scale()

		return {
			restrict: 'A'
			link: link
		}


angular.module('app').directive 'scaleFont', [
	'$window',
	'$document',
	ScaleFont
	]
