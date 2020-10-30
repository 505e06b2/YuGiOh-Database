#!/usr/bin/env python3
import json
import sqlite3

query = """
SELECT datas.id, datas.alias, datas.type, datas.atk, datas.def, datas.level, datas.race, datas.attribute, datas.category, texts.name, texts.desc
from datas, texts
where datas.id = texts.id
"""

output = []

# TABLE

def getCardTypesList(i):
	out = []

	if (i & 0x00000001): out.append("Monster")
	if (i & 0x00000002): out.append("Spell")
	if (i & 0x00000004): out.append("Trap")

	#spell/trap
	if (i & 0x00010000): out.append("Quick-Play")
	if (i & 0x00020000): out.append("Continuous")
	if (i & 0x00040000): out.append("Equip")
	if (i & 0x00080000): out.append("Field")
	if (i & 0x00100000): out.append("Counter")

	#monster - ordered via card text order
	#if (i & 0x00000010): out.append("Normal")
	#if (i & 0x00000100): out.append("Trap-Monster")
	#if (i & 0x00004000): out.append("Token") #will have Monster+Normal active too
	#if (i & 0x08000000): out.append("Skill")
	#if (i & 0x10000000): out.append("Action")
	#if (i & 0x02000000): out.append("Special-Summon")

	if (i & 0x00000040): out.append("Fusion")
	if (i & 0x00000080): out.append("Ritual")
	if (i & 0x00002000): out.append("Synchro")
	if (i & 0x00800000): out.append("Xyz")
	if (i & 0x04000000): out.append("Link")

	if (i & 0x01000000): out.append("Pendulum")

	if (i & 0x00400000): out.append("Toon")
	if (i & 0x00000200): out.append("Spirit")
	if (i & 0x00000400): out.append("Union")
	if (i & 0x00000800): out.append("Gemini")
	if (i & 0x00200000): out.append("Flip")

	if (i & 0x00001000): out.append("Tuner")

	if (i & 0x00000020): out.append("Effect")

	return out

def getAttributeString(i): #return them normally, as they can be made fullcaps later
	if (i & 0x01): return "Earth"
	if (i & 0x02): return "Water"
	if (i & 0x04): return "Fire"
	if (i & 0x08): return "Wind"
	if (i & 0x10): return "Light"
	if (i & 0x20): return "Dark"
	if (i & 0x40): return "Divine"
	return "None? %x" % i

def getRaceString(i):
	if i == 0: return "None"
	if (i & 0x0000001): return "Warrior"
	if (i & 0x0000002): return "Spellcaster"
	if (i & 0x0000004): return "Fairy"
	if (i & 0x0000008): return "Fiend"
	if (i & 0x0000010): return "Zombie"
	if (i & 0x0000020): return "Machine"
	if (i & 0x0000040): return "Aqua"
	if (i & 0x0000080): return "Pyro"
	if (i & 0x0000100): return "Rock"
	if (i & 0x0000200): return "Winged-Beast"
	if (i & 0x0000400): return "Plant"
	if (i & 0x0000800): return "Insect"
	if (i & 0x0001000): return "Thunder"
	if (i & 0x0002000): return "Dragon"
	if (i & 0x0004000): return "Beast"
	if (i & 0x0008000): return "Beast-Warrior"
	if (i & 0x0010000): return "Dinosaur"
	if (i & 0x0020000): return "Fish"
	if (i & 0x0040000): return "Sea Serpent"
	if (i & 0x0080000): return "Reptile"
	if (i & 0x0100000): return "Psychic"
	if (i & 0x0200000): return "Divine-Beast"
	if (i & 0x0400000): return "Creator God"
	if (i & 0x0800000): return "Wyrm"
	if (i & 0x1000000): return "Cyberse"
	return "None? %x" % i

def getLinkMarkerList(i):
	out = []

	#in a nice order
	if (i & 0x001): out.append("⬃") #bottom_left
	if (i & 0x008): out.append("⇦") #left
	if (i & 0x040): out.append("⬁") #top_left
	if (i & 0x080): out.append("⇧") #top

	if (i & 0x002): out.append("⇩") #bottom
	if (i & 0x020): out.append("⇨") #right
	if (i & 0x100): out.append("⬀️") #top_right
	if (i & 0x004): out.append("⬂") #bottom_right

	return out

# TABLE END

conn = sqlite3.connect("BabelCDB/cards.cdb")
c = conn.cursor()

for card in c.execute(query):
	if card[1] or "Token" in card[9]: #alias or token
		continue

	#if any(x["name"] == card[9] for x in output):
	#	print("!!! \"%s\" already exists !!!" % card[9])

	card_data = {
		"name": card[9],
		"id": card[0],
		"desc": card[10],
		"types": getCardTypesList(card[2])
	}

	if "Monster" in card_data["types"]:
		card_data["atk"] = card[3]
		card_data["race"] = getRaceString(card[6])
		card_data["attribute"] = getAttributeString(card[7])

		if "Link" in card_data["types"]:
			card_data["arrows"] = getLinkMarkerList(card[4])
			card_data["level"] = card[5]
		else: #standard monster
			card_data["def"] = card[4]

			if "Pendulum" in card_data["types"]:
				card_data["scale"] = (card[5] & 0xff000000) >> 24 #move 3 bytes down
				effects = card[10].replace("[ Pendulum Effect ]\n", "").replace("[ Monster Effect ]\n", "").split("\n----------------------------------------\n")
				try:
					card_data["desc"] = effects[1]
					card_data["pendulum"] = effects[0]
				except IndexError:
					pass #no pendulum effect
			card_data["level"] = (card[5] & 0x0000ffff) #removes duplicate line for Pendulums


	output.append(card_data)
	#print(getCardTypesList(card[2]))

with open("../db.json", "w") as f:
	output.sort(key=lambda x: x["name"])
	json.dump(output, f)
#print(output)
