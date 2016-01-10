

angular.module('app').constant
	'userRoles':
		user: 'user'
		driver: 'driver'
		admin: 'admin'
	'event':
		REQUIRE_LOGIN: 'require_login'
		LOGIN: 'login'
		LOGOUT: 'logout'
		SIGNUP: 'signup'
		ENTER_BUS: 'enter_bus'
		LEAVE_BUS: 'leave_bus'
	'storageKey':
		PAY_STEP_SEQNO: 'pay_step_seqno'
		PAY_BUS_LINE: 'pay_bus_line'
		TICKETS: 'tickets'
		SIGNUP_USER: 'signup_user'
		LAST_POSITION: 'last_position'
		SETTING_REFRESH_RATE: 'setting_refresh_rate'
		BUS: 'bus'
		BEACON_LAST_TS: 'beacon_last_ts'

