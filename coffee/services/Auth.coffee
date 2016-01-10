
class Auth
	constructor: ($http, $rootScope, $localStorage, $base64, settings, event) ->
		self = @
		anon_user =
			username: ''
			groups: []
			token: ''
			
		$storage = $localStorage.$default
			user: anon_user

		get_current_user = ->
			if not $rootScope.user
				$rootScope.user = $storage.user
			$rootScope.user

		set_current_user = (user)->
			$storage.user = user
			$rootScope.user = user
			self.user = user
			user

		role_prefix = 'ROLE_'
		l = role_prefix.length

		# object to return
		@user = get_current_user()
		
		@authorize = (role) =>
			# console.log @user.groups
			# auths = (auth.groups[l..].toLowerCase() for auth in @user.groups)
			role in @user.groups

		@isLoggedIn = (user) =>
			user = user || @user
			user.username isnt ''

		# @login_o2 = (user, success, error) =>
		# 	auth = $base64.encode(user.username + ':' + user.password)
		# 	headers =
		# 		Authorization: 'Basic ' + auth
		# 	$http
		# 		.get(settings.apiurl + '/user/', {headers: headers})
		# 		.success (user)->
		# 			user.auth = auth
		# 			set_current_user user
		# 			success user
		# 			$rootScope.$broadcast event.LOGIN, user
		# 		.error error

		@login = (user, success, error) =>
			$http
				.post(settings.baseurl + '/api-token-auth/', {
					username: user.username,
					password: user.password }, {
						headers:
							Authorization: undefined
					})
				.success (ret)->
					# console.log ret
					user.token = ret.token
					$http.get(settings.baseurl + '/userprofile/curruser/', {
						headers:
							Authorization: 'Token '+ ret.token
						})
						.success (user)->
							# console.log user
							persist_user =
								id: user.id
								username: user.username
								# password: user.password
								phone: user.phone
								groups: user.groups
								token: ret.token
							
							set_current_user persist_user
							success persist_user
							$rootScope.$broadcast event.LOGIN, persist_user
						.error error
				.error error

		@signup = (user, success, error) =>
			$http
				.post(settings.baseurl + '/userprofile/signup/', user)
				.success (user)->
					# console.log user
					persist_user =
						id: user.id
						username: user.username
						phone: user.username
						groups: user.groups
						token: user.token
					set_current_user persist_user
					success persist_user
					$rootScope.$broadcast event.SIGNUP, persist_user
				.error error

		@logout = () =>
			set_current_user anon_user
			$rootScope.$broadcast event.LOGOUT

		return @


angular.module('app').factory 'Auth', ['$http', '$rootScope', '$localStorage', '$base64', 'settings', 'event', Auth]
