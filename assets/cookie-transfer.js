function CookieTransfer(uri, cookieNames) {
	this.uri = uri;
	this.desiredCookies = cookieNames;
}

CookieTransfer.prototype.run = function () {
	if (this.isBrowserSupported()) {
		var cookiesNotTransfered = this.determineCookiesInNeedOfTransfer();
		if (cookiesNotTransfered.length > 0) {
			this.transferCookies(cookiesNotTransfered);
		}
	}
};

CookieTransfer.prototype.determineCookiesInNeedOfTransfer = function () {
	var ret = [];
	for (var i=0; i < this.desiredCookies.length; i++) {
		var cookieName = this.desiredCookies[i];
		if (!this.cookieHasBeenTransferred(cookieName)) {
			ret.push(cookieName);
		}
	}
	return ret;
};

CookieTransfer.prototype.cookieHasBeenTransferred = function (cookieName) {
	var cookieStatusName = this.getCookieStatusName(cookieName);
	var cookieValue = $.cookie(cookieStatusName);
	return (cookieValue !== null && cookieValue !== undefined);
};

CookieTransfer.prototype.getCookieStatusName = function (cookieName) {
	return cookieName + "_xfrd";
};

CookieTransfer.prototype.transferCookies = function (cookiesToTransfer) {
	this.getCookies(cookiesToTransfer, this.cookieSuccessHandler);
};

CookieTransfer.prototype.cookieSuccessHandler = function (requestedCookieNames, receivedCookieMap) {
	var daysToLive = 365 * 60;
	for (var i = 0; i < requestedCookieNames.length; i++) {
		var cookieName = requestedCookieNames[i];
		var cookieValue = receivedCookieMap[cookieName];
		if (cookieValue) {
			$.cookie(cookieName, cookieValue, {expires: daysToLive, path: '/'});
		}

		//Important: We mark the cookie name as transferred so we don't try to fetch it again.
		// We do this even if we didn't get a value for that cookie. That would indicate the cookie doesn't have a value.
		var cookieStatusName = this.getCookieStatusName(cookieName);
		$.cookie(cookieStatusName, "true", {expires: daysToLive, path: '/'});
	}
};

CookieTransfer.prototype.getCookies = function(cookieNames, successHandler) {
	var callbackObj = this;

	var postData = "";
	for (var i = 0; i < cookieNames.length; i++) {
		var cookieName = cookieNames[i];
		if (postData !== "") {
			postData += "&"
		}
		postData += "name=" + cookieName;
	}

	var request = new XMLHttpRequest();
	request.open("POST.html", this.uri, true);
	request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	request.withCredentials = "true";
	request.onreadystatechange = handler;
	request.send(postData);

	function handler(evtXHR) {
		if (request.readyState == 4 && request.status == 200) {
			var cookieMap = jQuery.parseJSON(request.responseText);
			successHandler.call(callbackObj, cookieNames, cookieMap);
		}
	}
};

CookieTransfer.prototype.isBrowserSupported = function () {
	var xhr = new XMLHttpRequest();
	return "withCredentials" in xhr;
};
