const artwork_url = "https://storage.googleapis.com/ygoprodeck.com/pics_artgame/${id}.jpg";

const database = new Database();

function clearSearch() {
	const search_elem = document.querySelector("#search-text");
	search_elem.value = "";
	search_elem.disabled = "";
	search_elem.focus();

	document.querySelector("#clear-search").style.display = "";
	document.querySelector('#list').innerHTML = `<div class="message">Use the textbox above to search</div>`;
}

function displaySearch() {
	const list_elem = document.querySelector('#list');
	const search_elem = document.getElementById("search-text");
	const search_text = search_elem.value;

	list_elem.scrollTo(0,0);

	if(search_text.trim().length === 0) {
		clearSearch();
		return;
	}

	const html = database.generateHTML(search_text);
	if(html === null) {
		list_elem.innerHTML = `<div class="error">Too many results, try a longer query</div>`;
		return;
	} else if (html.length === 0) {
		list_elem.innerHTML = `<div class="error">No results, try a different query</div>`;
		return;
	}
	list_elem.innerHTML = html;
	search_elem.blur();
}

function displayCard(i) {
	console.log(i);
	const card = database.get()[i];
	document.querySelector('#display #top #title').innerHTML = card["name"];
	document.querySelector('#display #middle #limit').innerHTML = (card["limit"]) ? "Limit: " + card["limit"] : "";
	document.querySelector('#display #bottom #description').innerHTML = card["desc"];

	let attribute = card["types"][0].toLowerCase();
	let class_name = card["types"][0].toLowerCase();
	if(card["types"][0] === "Monster") {
		let atkdef_line = `ATK/${card["atk"]}`;
		let level_line = "";

		attribute = card["attribute"].toLowerCase();

		if(card["types"][1] === "Fusion") class_name = "fusion_" + class_name;
		else if(card["types"][1] === "Xyz") class_name = "xyz_" + class_name;
		else if(card["types"][1] === "Link") class_name = "link_" + class_name;
		else if(card["types"][1] === "Ritual") class_name = "ritual_" + class_name;
		else if(card["types"][1] === "Synchro") class_name = "synchro_" + class_name;
		else if(card["types"].includes("Effect")) class_name = "effect_" + class_name;
		else class_name = "normal_" + class_name;

		if(card["types"].includes("Pendulum")) class_name = "pendulum " + class_name;

		document.querySelector('#display #bottom .types-container').style.display = "";
		document.querySelector('#display #bottom #atkdef').style.display = "";

		document.querySelector('#display #bottom #types').innerHTML = [card["race"]].concat(card["types"].slice(1)).join(" / ");

		if(card["types"][1] === "Link") level_line = `<span class="arrows">[ ${card["arrows"].join(" ")} ]</span>`;
		else if(card["types"][1] === "Xyz") level_line = `Rank ${card["level"]}`;
		else level_line = `Level ${card["level"]}`;
		document.querySelector('#display #top #levels').innerHTML = level_line;

		if(card["types"][1] === "Link") atkdef_line += ` LINK-${card["level"]}`;
		else atkdef_line += ` DEF/${card["def"]}`;
		document.querySelector('#display #bottom #atkdef').innerHTML = atkdef_line;

	} else { //trap / spell
		let type = card["types"][0];
		if(card["types"][1]) type = `${card["types"][1]} ` + type;
		document.querySelector('#display #top #levels').innerHTML = `[${type} Card]`;
		document.querySelector('#display #bottom .types-container').style.display = "none";
		document.querySelector('#display #bottom #atkdef').style.display = "none";

	}

	document.querySelector('#display #top #attribute').src = `assets/attribute_${attribute}.png`;
	document.querySelector('#display').className = class_name;


	if(card["types"].includes("Pendulum")) {
		document.querySelector('#display #middle #pendulum #art').src = artwork_url.replace("${id}", card["id"]);
		document.querySelector('#display #middle #pendulum #effect').innerHTML = `Scale ${card["scale"]}\n` + ((card["pendulum"]) ? card["pendulum"] : "");
		document.querySelector('#display #middle #pendulum').style.display = "";
		document.querySelector('#display #middle #standard').style.display = "none";
	} else {
		document.querySelector('#display #middle #standard #art').src = artwork_url.replace("${id}", card["id"]);
		document.querySelector('#display #middle #pendulum').style.display = "none";
		document.querySelector('#display #middle #standard').style.display = "";
	}

	document.querySelector('#display').style.display = "block";
	document.querySelector('#search').style.display = "none";
	history.pushState({}, card["name"])
}

function closeCard() {
	document.querySelector('#search').style.display = "";
	document.querySelector('#display').style.display = "";
}

window.onload = async () => {
	if("serviceWorker" in navigator) navigator.serviceWorker.register("service_worker.js");
	await database.update();
	clearSearch();
	//displayCard(3275);
}

window.onpopstate = closeCard;
