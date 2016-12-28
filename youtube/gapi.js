// google api scripts

;(function(GoogleAPI){
	
	var apiReady = new $.Deferred(),
		apiCallbackName = "gapi_loaded_" + (new Date()).getTime(),
		apiKey = window.magnoliaFrontendData.gapiKey;

	window[apiCallbackName] = function(){
		gapi.client.setApiKey(apiKey);
		apiReady.resolve(true);
	};

	var firstScriptTag = document.getElementsByTagName('script')[0];
	var tag = document.createElement('script');
	tag.src = "https://apis.google.com/js/client.js?onload=" + apiCallbackName;
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	GoogleAPI.request = function(request, callback, failback){
		$.when(apiReady).then(function(){
			gapi.client.request(request).then(function(resp) {
				if(callback){
					callback(resp.result);
				}

				if(GoogleAPI.debug){
					console.info(reason.result.error.message, reason.result.error);
				}
			}, function(reason) {
				if(failback){
					failback(reason.result);
				}

				if(GoogleAPI.debug){
					console.error(reason.result.error.message, reason.result.error);
				}
			});
		}, function(){
			if(failback){
				failback("error loading api");
			}

			if(GoogleAPI.debug){
				console.error("error loading api");
			}
		});
	};

})(window.GoogleAPI = window.GoogleAPI || {});