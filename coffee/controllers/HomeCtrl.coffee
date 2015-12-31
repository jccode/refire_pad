
class HomeCtrl
	constructor: (@$scope, @$timeout)->
		@DELAY = 20
		@active = 0
		@video1 = document.getElementById "video1"
		@video2 = document.getElementById "video2"
		# window.v1 = @video1
		# window.v2 = @video2

		@video1.addEventListener 'ended', @video_end_listener.bind(@), false
		@video2.addEventListener 'ended', @video_end_listener.bind(@), false

		@active_handler(@active)

	video_end_listener: ()->
		@incr_active()

	incr_active: ()->
		@active = (@active + 1) % 5
		@$scope.$apply()
		@active_handler @active

	active_handler: (idx)->
		# console.log "active handler #{idx} "
		switch idx
			when 0 then @play_video(@video1)
			when 1 then @play_video(@video2)
			when 2 then @delay_and_next()
			when 3 then @delay_and_next()
			when 4 then @delay_and_next()
			else console.log 'fuck. Should not be in here.'

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


angular.module('app').controller 'HomeCtrl', ['$scope', '$timeout', HomeCtrl]
