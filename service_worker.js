self.addEventListener("install", (e) => {
	e.waitUntil((async () => {
		return (await caches.open("ygo")).addAll([
			"index.html",
			"db.json",
			"manifest.webmanifest",

			"css/main.css",
			"css/display.css",
			"css/card_colours.css",

			"js/main.js",
			"js/database.js",

			"assets/error.png",
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
	})());
	//console.log("[SW] Installation complete");
});

self.addEventListener("fetch", (e) => {
	const request_url = new URL(e.request.url);

	if(navigator.onLine) { //at some point, make it so that the only file check is db.json - for the moment, as this is WIP, this is okay
		e.respondWith((async () => {
			const response = await fetch(e.request);
			if(request_url.hostname === location.hostname) {
				console.log("[SW] Updated cache for ", request_url.pathname);
				(await caches.open("ygo")).put(e.request, response.clone());
			}
			return response;
		})());
		return;
	}

	console.log("[SW] Using cache for", request_url.pathname);
	e.respondWith((async () => await caches.match(e.request))());
});
