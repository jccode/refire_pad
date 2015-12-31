
class TrustedFilter
	constructor: ($sce) ->
		return (url) ->
			$sce.trustAsResourceUrl url


angular.module('app').filter 'trusted', ['$sce', TrustedFilter]
