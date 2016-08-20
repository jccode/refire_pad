
class HomeCtrl
	constructor: (@$rootScope, @$scope, @$timeout, @$window)->
		@DELAY = 10				# 20
		@active = 0
		@video1 = document.getElementById "video1"
		# @video2 = document.getElementById "video2"
		# @video3 = document.getElementById "video3"
		# @sections = document.getElementsByClassName "section"

		# @video1.addEventListener 'ended', @video_end_listener.bind(@), false
		# @video2.addEventListener 'ended', @video_end_listener.bind(@), false
		# @video3.addEventListener 'ended', @video_end_listener.bind(@), false

		# @active_handler(@active)

	video_end_listener: ()->
		@incr_active()

	incr_active: ()->
		@active = (@active + 1) % 1
		
		@$scope.$apply()
		@active_handler @active
		@$scope.$broadcast 'activeChanged', @active

	active_handler: (idx)->
		switch idx
			when 0 then @play_video(@video1)
			when 1 then @delay_and_next()
			# when 2 then @delay_and_next()
			# when 3 then @play_video(@video3)
			# when 4 then @delay_and_next()
			# when 5 then @delay_and_next()
			else console.log 'fuck. Should not in here.'

	delay_and_next: ()->
		@$timeout @incr_active.bind(@), @DELAY*1000

	play_video: (video)->
		try
			@video_full_screen video
		catch err
			console.log err
		video.play()

	video_full_screen: (elem)->
		if elem.requestFullscreen
			elem.requestFullscreen()
		else if elem.mozRequestFullScreen
			elem.mozRequestFullScreen()
		else if elem.webkitRequestFullscreen
			elem.webkitRequestFullscreen()
		else
			console.log 'fullscreen api not support'


angular.module('app').controller 'HomeCtrl', ['$rootScope', '$scope', '$timeout', '$window', HomeCtrl]
