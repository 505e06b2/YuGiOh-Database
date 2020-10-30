self.addEventListener("install", (e) => {
	e.waitUntil( caches.open("ygo").then(
		(cache) => cache.addAll([
			"/",
			"/db.json",

			"/css/main.css",
			"/css/display.css",
			"/css/card_colours.css",

			"/js/main.js",
			"/js/database.js",
		])
	));
	//console.log("[SW] Installation complete");
});

self.addEventListener("fetch", (e) => {
	if(navigator.onLine) {
		console.log("[SW] Fetch let through", e.request.url);
		e.respondWith(fetch(e.request));
		return;
	}

	console.log("[SW] Caught fetch", e.request.url);
	e.respondWith( caches.match(e.request).then(
		(response) => response || fetch(e.request)
	));
});
