$(document).ready(function () {
	var url = "education-portal.com/de7ebf8a1df94fe59a66420f33c356a5.ajax";
	var prefix = "//";

	var host = document.location.host;
	var parts = host.split(".");
	if (parts.length > 0) {
		var firstPart = parts[0];
		var allowedSubDomains = ['local', 'sc1', 'sc2', 'd10', 'qa01'];
		if ($.inArray(firstPart, allowedSubDomains) != -1) {
			prefix += firstPart + "."
		}
	}
	var finalUrl = prefix + url;

	var cookieTransfer = new CookieTransfer(finalUrl, ['ariel', 'member']);
	cookieTransfer.run();
});