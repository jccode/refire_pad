
class I18N
	constructor: (gettextCatalog) ->
		gettextCatalog.setCurrentLanguage 'zh'
		# gettextCatalog.debug = true


angular.module('app').run ['gettextCatalog', I18N]
		
