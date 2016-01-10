
class Ajax
	constructor: ($httpProvider, $resourceProvider) ->

		# http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
		serialize = (obj) ->
			return Object.keys(obj).reduce((a,k)->
				a.push(k+'='+encodeURIComponent(obj[k]))
				return a
			,[]).join('&')
		
		$httpProvider.defaults.withCredentials = true
		$httpProvider.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest"

		# post data as form
		# $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
		# $httpProvider.defaults.transformRequest = [ (data)=>
		# 	if angular.isObject(data) and String(data) isnt '[Object File]' then serialize(data) else data
		# 	]

		# $httpProvider.defaults.headers.common["Access-Control-Request-Headers"] = "accept, origin, authorization"
		$resourceProvider.defaults.stripTrailingSlashes = false

angular.module('app').config ['$httpProvider', '$resourceProvider', Ajax]
