// youtube api scripts

;(function(Youtube){

	var apiReady = new $.Deferred(),
		videoItemsReady = new $.Deferred(),
		playlistItemsReady = new $.Deferred(),
		apiCallbackName = "onYouTubeIframeAPIReady",
		thumbnailResolutions = {
			'medium': 320,
			'high': 480,
			'standard': 640,
			'maxres': 1280
		},
		videoRequest = {
			'path': '/youtube/v3/videos',
			'params': {
				'part': 'snippet',
				'fields': 'items(id,snippet(thumbnails))',
				'maxResults': 50
			}
		},
		playlistRequest = {
			'path': '/youtube/v3/playlists',
			'params': {
				'part': 'contentDetails,snippet',
				'fields': 'items(id,contentDetails,snippet(title,channelTitle,thumbnails))',
				'maxResults': 50
			}
		},
		dataItems = {},
		firstScriptTag = document.getElementsByTagName('script')[0],
		tag = document.createElement('script');

	window[apiCallbackName] = function(){
		apiReady.resolve(true);
	};
	
	tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	$(function(){
		var container = $('.video-player'),
			videos = container.not('.playlist'),
			playlists = container.filter('.playlist'),
			videoPlaylists = $('.video-playlists-group .video-playlist');

		if(videos.size() > 0) {
			videoRequest.params.id = videos.map(function(){
				return $(this).data('id');
			}).get().join(',');

			GoogleAPI.request(videoRequest, function handleVideoResult(result){
				for(var i = 0 ; i < result.items.length ; i++){
					dataItems[result.items[i].id] = result.items[i];
				}

				if(result.nextPageToken){
					videoRequest.params.pageToken = result.nextPageToken;
					GoogleAPI.request(videoRequest, handleVideoResult);
				} else {
					videoItemsReady.resolve(true);

					videos.each(function(){
						var video = $(this),
							player = video.find('.player'),
							id = video.data('id'),
							thumbnails = dataItems[id] && dataItems[id].snippet.thumbnails;

						if(thumbnails){
							new Youtube.player(video, player, id, Youtube.getThumbnail(thumbnails, player.outerWidth(), player.outerHeight()));
						}
					});
				}
			});
		} else {
			videoItemsReady.resolve(true);
		}

		if(playlists.size() > 0) {
			playlistRequest.params.id = playlists.map(function(){
				return $(this).data('id');
			}).get().join(',');

			GoogleAPI.request(playlistRequest, function handlePlaylistsResult(result){
				for(var i = 0 ; i < result.items.length ; i++){
					dataItems[result.items[i].id] = result.items[i];
				}

				if(result.nextPageToken){
					playlistRequest.params.pageToken = result.nextPageToken;
					GoogleAPI.request(playlistRequest, handlePlaylistsResult);
				} else {
					playlistItemsReady.resolve(true);

					playlists.each(function(){
						var playlist = $(this),
							id = playlist.data('id'),
							playlistItemsRequest = {
								'path': '/youtube/v3/playlistItems',
								'params': {
									'playlistId': id,
									'part': 'snippet',
									'fields': 'nextPageToken,items/snippet(thumbnails/default,resourceId/videoId,title,channelTitle)',
									'maxResults': 50
								}
							},
							playlistPlayer = new Youtube.playlistPlayer(playlist, id, dataItems[id]),
							itemOffset = 0;

						GoogleAPI.request(playlistItemsRequest, function handlePlaylistItemsResult(result) {
							var offset = itemOffset;

							window.setTimeout(function(){
								playlistPlayer.addPlaylistItems(result.items, offset);
							},10);

							if(result.nextPageToken){
								itemOffset += playlistItemsRequest.params.maxResults;
								playlistItemsRequest.params.pageToken = result.nextPageToken;

								window.setTimeout(function(){
									GoogleAPI.request(playlistItemsRequest, handlePlaylistItemsResult);
								},10);
							}
						});
					});
				}
			});
		} else {
			playlistItemsReady.resolve(true);
		}

		$.when(videoItemsReady, playlistItemsReady).then(function(){
			videoPlaylists.each(function(){
				var videoPlaylist = $(this),
					container = videoPlaylist.closest('.video-playlists-group'),
					index = videoPlaylist.parent().index(),
					video = container.find('.video-player').eq(index),
					player = video.find('.player'),
					id = videoPlaylist.data('id'),
					wrapper = videoPlaylist.find('.thumbnail'),
					thumbnail = Youtube.getThumbnail((dataItems[id] && dataItems[id].snippet.thumbnails), wrapper.outerWidth(), wrapper.outerHeight()),
					overrideThumbnail = video.data('playlist-thumbnail');

				if(overrideThumbnail) {
					$('<img/>', {
						src: overrideThumbnail,
						css: {
							width: thumbnail.width
						}
					}).appendTo(wrapper);
				} else {
					$('<img/>', thumbnail).appendTo(wrapper);
				}

				container.find('.video-playlist-container.playlist-all:visible, .video-playlist-container.playlist-' + index + ':visible').append(video);

				videoPlaylist.on('click', function(ev){
					ev.preventDefault();

					var activate = !videoPlaylist.hasClass('active'),
						active = container.find('.video-playlist.active')

					if(activate){
						if(active.length > 0){
							active.one('youtube.deactivated', function(){
								videoPlaylist.trigger('youtube.activate');
							}).trigger('youtube.deactivate');
						} else {
							videoPlaylist.trigger('youtube.activate');
						}
					} else {
						videoPlaylist.trigger('youtube.deactivate');
					}
					
				}).on('youtube.activate', function(){
					videoPlaylist.addClass('active');
					video.addClass('active').slideDown(function(){
						videoPlaylist.trigger('youtube.activated');
					});
				}).on('youtube.deactivate', function(){
					player.trigger('youtube.stop');
					videoPlaylist.removeClass('active');
					video.slideUp(function(){
						video.removeClass('active');
						videoPlaylist.trigger('youtube.deactivated');
					});
				})
			});
		});
	});

	Youtube.isWidescreen = function(width, height) {
		return (width / height === 16/9);
	}

	Youtube.correctDimension = function(width, height){
		var widescreen = Youtube.isWidescreen(width, height);

		return {
			'widescreen': widescreen,
			'width': width,
			'height': widescreen ? height : (3 * height / 4)
		}
	}

	Youtube.getZoomFactor = function(size, width, height){
		return Math.max(width / size.width, height / size.height) + 0.02;
	}

	Youtube.getThumbnail = function(thumbnails, width, height) {
		var thumbnail = thumbnails["default"],
			size = Youtube.correctDimension(thumbnail.width, thumbnail.height),
			zoom = Youtube.getZoomFactor(size, width, height);

		for(var i in thumbnailResolutions){
			if(thumbnailResolutions.hasOwnProperty(i)){
				if(thumbnails[i]){
					size = Youtube.correctDimension(thumbnails[i].width, thumbnails[i].height);

					if(((thumbnail.width < width && size.width > thumbnail.width) || (size.width > width && size.width < thumbnail.width))) {
						thumbnail = thumbnails[i];
						zoom = Youtube.getZoomFactor(size, width, height);
					}
				}
			}
		}

		for(var i in thumbnailResolutions){
			if(thumbnailResolutions.hasOwnProperty(i)){
				if(thumbnails[i]){
					size = Youtube.correctDimension(thumbnails[i].width, thumbnails[i].height);

					if(thumbnail.width < size.width && ((thumbnail.height < height && size.height > thumbnail.height) || (size.height > height && size.height < thumbnail.height))) {
						thumbnail = thumbnails[i];
						zoom = Youtube.getZoomFactor(size, width, height);
					}
				}
			}
		}
		

		return {
			'src': thumbnail.url,
			'css': {
				'width': (zoom * thumbnail.width) + 'px',
				'margin-top': ((height - (zoom * thumbnail.height)) / 2) + 'px',
				'margin-left': ((width - (zoom * thumbnail.width)) / 2) + 'px'
			}
		};
	};

	Youtube.playlistPlayer = function(playlist, id, info) {
		var that = this,
			ready = new $.Deferred();

		this.playlist = playlist;
		this.player = this.playlist.find('.player').addClass('paused');
		this.listContainer = this.playlist.find('.list');
		this.listHeader = $('<div class="header"/>').appendTo(this.listContainer)
		this.list = $('<ul/>').appendTo(this.listContainer);

		this.listHeaderTitle = $('<div class="title"/>').text(info.snippet.title).appendTo(this.listHeader);

		this.playIndex = -1;
		this.width = this.player.outerWidth();
		this.height = this.player.outerHeight();

		var overrideThumbnail = this.playlist.data('thumbnail');

		if(overrideThumbnail) {
			this.image = $('<img/>', {
				src: overrideThumbnail,
				css: {
					width: this.width + 'px'
				}
			}).appendTo(this.player);
		} else {
			var thumbnail = Youtube.getThumbnail(info.snippet.thumbnails, this.width, this.height);

			this.image = $('<img/>', thumbnail).appendTo(this.player);
		}

		this.autoplay = parseInt(this.playlist.data('autoplay'), 10) || 0;
		this.rel = parseInt(this.playlist.data('rel'), 10) || 0;

		// TODO: switch back to commented line as soon as google fixed this
		// this.placeholder = $('<iframe width="' + this.width + '" height="' + this.height + '" src="https://www.youtube-nocookie.com/embed/videoseries?list=' + id + '&autoplay=' + this.autoplay + 'rel=' + this.rel + '&listType=playlist&modestBranding=1&showInfo=0&loop=1&enablejsapi=1" frameborder="0" allowfullscreen></iframe>').appendTo(this.player);
		this.placeholder = $('<iframe width="' + this.width + '" height="' + this.height + '" src="https://www.youtube.com/embed/videoseries?list=' + id + '&autoplay=' + this.autoplay + 'rel=' + this.rel + '&listType=playlist&modestBranding=1&showInfo=0&loop=1&enablejsapi=1" frameborder="0" allowfullscreen></iframe>').appendTo(this.player);
		
		$.when(apiReady).then(function() {
			that._player = new YT.Player(that.placeholder.get(0), {
				events: {
					'onReady': function(event){
						ready.resolve(true);
					},
					'onStateChange': function(event){
						if (event.data === YT.PlayerState.PAUSED) {
							// is there a better way?
							try {
								JSON.parse(event.target.getDebugText());
								that.player.addClass('paused');
							} catch(e) {}
						} else {
							if(event.data === YT.PlayerState.ENDED && that.rel !== 1) {
								that.player.addClass('paused');
							} else {
								that.player.removeClass('paused');
							}
						}

						if(event.target.getPlaylistIndex() !== that.playIndex){
							$(that.list).find(".active").removeClass("active");

							that.playIndex = event.target.getPlaylistIndex();

							$(that.list).find("li").eq(that.playIndex).addClass("active");
						}
					}
				}
			});
		});

		that.list.on('click', 'li', function(ev){
			ev.preventDefault();
			var li = $(this);

			$.when(ready).then(function(){
				var index = li.index();
				that._player.playVideoAt(index);
			});
		});

		this.player.on('click', function(ev) {
			$.when(ready).then(function(){
				that._player.playVideo();
			});
		}).on('youtube.stop', function(){
			$.when(ready).then(function(){
				that._player.pauseVideo();
			})
		});
	};

	Youtube.playlistPlayer.prototype.addPlaylistItems = function(items, offset){
		var listHtml = this.list.html();
		for(var i = 0 ; i < items.length ; i++){
			listHtml +=	'<li' + ((offset + i) === this.playIndex ? ' class="active"' : '') + '>' +
						'<div class="clearfix">' +
						'<div class="index"><span>' + (offset+i+1) + '</span></div>' +
						'<div class="thumbnail">' +
						'<img src="' + items[i].snippet.thumbnails["default"].url + '"/>' +
						'</div>' +
						'<div class="information">' +
						'<div class="title">' + items[i].snippet.title + '</div>' +
						'<div class="channel">' + items[i].snippet.channelTitle + '</div>' +
						'</div>' +
						'</div>' +
						'</li>';
		}

		this.list.html(listHtml);
	};

	Youtube.player = function(videoPlayer, player, id, thumbnail) {
		var that = this,
			ready = new $.Deferred();

		this.videoPlayer = videoPlayer;
		this.player = player.addClass('paused');

		this.width = this.player.outerWidth();
		this.height = this.player.outerHeight();

		var overrideThumbnail = this.videoPlayer.data('thumbnail');

		if(overrideThumbnail) {
			this.image = $('<img/>', {
				src: overrideThumbnail,
				css: {
					width: this.width + 'px'
				}
			}).appendTo(this.player);
		} else {
			this.image = $('<img/>', thumbnail).appendTo(player);
		}

		this.autoplay = parseInt(this.videoPlayer.data('autoplay'), 10) || 0;
		this.rel = parseInt(this.videoPlayer.data('rel'), 10) || 0;

		// TODO: switch back to commented line as soon as google fixed this
		// this.placeholder = $('<iframe width="' + this.width + '" height="' + this.height + '" src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=' + this.autoplay + 'rel=' + this.rel + '&modestBranding=1&showInfo=0&enablejsapi=1" frameborder="0" allowfullscreen></iframe>').appendTo(player);
		this.placeholder = $('<iframe width="' + this.width + '" height="' + this.height + '" src="https://www.youtube.com/embed/' + id + '?autoplay=' + this.autoplay + 'rel=' + this.rel + '&modestBranding=1&showInfo=0&enablejsapi=1" frameborder="0" allowfullscreen></iframe>').appendTo(player);

		$.when(apiReady).then(function() {
			that._player = new YT.Player(that.placeholder.get(0), {
				events: {
					'onReady': function(event){
						ready.resolve(true);
					},
					'onStateChange': function(event){
						if (event.data === YT.PlayerState.PAUSED) {
							// is there a better way?
							try {
								JSON.parse(event.target.getDebugText());
								that.player.addClass('paused');
							} catch(e) {}
						} else {
							if(event.data === YT.PlayerState.ENDED && that.rel !== 1) {
								that.player.addClass('paused');
							} else {
								that.player.removeClass('paused');
							}
						}
					}
				}
			});
		});

		this.player.on('click', function(ev) {
			that.player.removeClass('paused');
			$.when(ready).then(function(){
				that._player.playVideo();
			});
		}).on('youtube.stop', function(){
			$.when(ready).then(function(){
				that._player.pauseVideo();
			})
		});
	};

})(window.Youtube = window.Youtube || {});