function Database() {
	//public
	this.update = async () => {
		if(updating) return; //guard
		updating = true;

		data = await (await fetch("db.json", {cache: "reload"})).json();
		console.log("Updated database");

		updating = false;
	}

	this.search = (text) => {
		const ret = [];
		if(!searchFunction((card) => ret.push(card), text)) return null;
		return ret;
	}

	this.generateHTML = (text) => {
		let ret = "";
		if( !searchFunction((card) => {
			let class_name = card["types"][0].toLowerCase();
			if(class_name === "monster") {
				if(card["types"][1] === "Fusion") class_name = "fusion_" + class_name;
				else if(card["types"][1] === "Xyz") class_name = "xyz_" + class_name;
				else if(card["types"][1] === "Link") class_name = "link_" + class_name;
				else if(card["types"][1] === "Ritual") class_name = "ritual_" + class_name;
				else if(card["types"][1] === "Synchro") class_name = "synchro_" + class_name;
				else if(card["types"].includes("Effect")) class_name = "effect_" + class_name;
				else class_name = "normal_" + class_name;

				if(card["types"].includes("Pendulum")) class_name = "pendulum " + class_name;
			}
			ret += `<div class="${class_name}" onclick="displayCard(${database.get().indexOf(card)});">${card["name"]}</div>`;
		}, text) ) return null;
		return ret;
	}

	this.get = () => data;

	//private
	let data = [];
	let updating = false;

	const searchFunction = (callback, text) => {
		text = text.toLowerCase();
		let count = 0;

		for(const card of data) {
			if( card["name"].toLowerCase().includes(text) || card["desc"].toLowerCase().includes(text) ) {
				if(++count > 500) return false;
				callback(card);
			}
		}

		return true;
	}
}
