(function() {
	'use strict';

	var pageContainerEl = document.getElementById('page-container');

	pageContainerEl.addEventListener('click', function(event) {
		var target = event.target;

		if (target && target.tagName && target.tagName.toLowerCase() == 'a') {
			event.preventDefault();

			window.history.pushState('myData', target.textContent, target.getAttribute('href'));
		}
	}, false);

	var logArea = document.getElementById('log-area');

	window.addEventListener('popstate', function(event){
		logArea.innerHTML = logArea.innerHTML + '<br>' + 'popstate event fired';
	 }, false);
}());