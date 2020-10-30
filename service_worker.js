self.addEventListener("install", (e) => {
	e.waitUntil( caches.open("ygo").then(
		(cache) => cache.addAll([
			"index.html",
			"db.json",

			"css/main.css",
			"css/display.css",
			"css/card_colours.css",

			"js/main.js",
			"js/database.js",

			"assets/attribute_dark.png",
			"assets/attribute_divine.png",
			"assets/attribute_earth.png",
			"assets/attribute_fire.png",
			"assets/attribute_light.png",
			"assets/attribute_spell.png",
			"assets/attribute_trap.png",
			"assets/attribute_water.png",
			"assets/attribute_wind.png",
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
