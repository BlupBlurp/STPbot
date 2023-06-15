const { EvolveTable, formPokemonNames } = require("../../lumibot/__gamedata");
const { getPokemonIdFromMonsNoAndForm } = require("./functions");
const { getPokemonName } = require("./name");

const None = 0,
	Item = 1,
	Move = 2,
	Pokemon = 3,
	Typing = 4,
	GameVersion = 5;

const EVOLUTION_METHOD_REQUIRES_LEVEL = [
	false,
	false,
	false,
	false,
	true,
	false,
	false,
	false,
	false,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	false,
	false,
	false,
	true,
	true,
	false,
	false,
	true,
	true,
	false,
	false,
	false,
	true,
	false,
	true,
	true,
	true,
	true,
	true,
	false,
	true,
	true,
	true,
	false,
	true,
	true,
	false,
	false,
	false,
	false,
	true,
	true,
];

const EVOLUTION_METHODS = [
	"",
	"On LvUp: high friendship",
	"On LvUp: high friendship & is day",
	"On LvUp: high friendship & is night",
	"On LvUp: Lv ≥ LvReq",
	"On Trade",
	"On Trade: holds item",
	"Karrablast/Shelmet Trade",
	"On UseItem",
	"On LvUp: Lv ≥ LvReq & Atk > Def",
	"On LvUp: Lv ≥ LvReq & Def > Atk",
	"On LvUp: Lv ≥ LvReq & Atk = Def",
	"On LvUp: Lv ≥ LvReq & rng(0-9) ≤ 4",
	"On LvUp: Lv ≥ LvReq & rng(0-9) > 4",
	"On LvUp: Lv ≥ LvReq → Get Shedinja",
	"SPECIAL_NUKENIN",
	"On LvUp: high beauty",
	"On UseItem: is male",
	"On UseItem: is female",
	"On LvUp: Lv ≥ LvReq & holds item & is day",
	"On LvUp: Lv ≥ LvReq & holds item & is night",
	"On LvUp: has move",
	"On LvUp: Pokémon in party",
	"On LvUp: Lv ≥ LvReq & is male",
	"On LvUp: Lv ≥ LvReq & is female",
	"On LvUp: is by magnetic field",
	"On LvUp: is by moss rock",
	"On LvUp: is by ice rock",
	"On LvUp: Lv ≥ LvReq & device upside down",
	"On LvUp: high friendship & has move of type",
	"On LvUp: Lv ≥ LvReq & Dark Pokémon in party",
	"On LvUp: Lv ≥ LvReq & is raining",
	"On LvUp: Lv ≥ LvReq & is day",
	"On LvUp: Lv ≥ LvReq & is night",
	"On LvUp: Lv ≥ LvReq & is female → set form to 1",
	"FRIENDLY",
	"On LvUp: Lv ≥ LvReq & is game version",
	"On LvUp: Lv ≥ LvReq & is game version & is day",
	"On LvUp: Lv ≥ LvReq & is game version & is night",
	"On LvUp: is by summit",
	"On LvUp: Lv ≥ LvReq & is dusk",
	"On LvUp: Lv ≥ LvReq & is outside region",
	"On UseItem: is outside region",
	"Galarian Farfetch'd Evolution",
	"Galarian Yamask Evolution",
	"Milcery Evolution",
	"On LvUp: Lv ≥ LvReq & has amped nature",
	"On LvUp: Lv ≥ LvReq & has low-key nature",
];

const EVOLUTION_METHOD_PARAM_TYPE = [
	None,
	None,
	None,
	None,
	None,
	None,
	Item,
	None,
	Item,
	None,
	None,
	None,
	None,
	None,
	None,
	None,
	None,
	Item,
	Item,
	Item,
	Item,
	Move,
	Pokemon,
	None,
	None,
	None,
	None,
	None,
	None,
	Typing,
	None,
	None,
	None,
	None,
	None,
	None,
	GameVersion,
	GameVersion,
	GameVersion,
	None,
	None,
	None,
	Item,
	None,
	None,
	None,
	None,
	None,
];

function genForms() {
	/*
  This is for generating a form object based on each labelName and arrayIndex from the zkn_form.json
  The format for the labelName is 'ZKN_FORM_{monsNo}_{formNo}'
  It iterates through labelNames and checks if the formNo is > 0
  If the formNo is > 0 it's added to the object.
  */
	const formNamedata = formPokemonNames;
	const formsList = formNamedata["labelDataArray"];
	const forms = {};

	for (let i = 0; i < formsList.length; i++) {
		const monForm = formsList[i];
		const formNo = parseInt(monForm["labelName"].split("_")[-1]);
		if (monForm["arrayIndex"] !== 0 && formNo > 0) {
			forms[monForm["labelName"]] = monForm["arrayIndex"];
		}
	}

	return forms;
}

const forms = genForms();

function getFormFormat(monsNo, formNo) {
	const monZeros = 3 - String(monsNo).length;
	const formZeros = 3 - String(formNo).length;
	if (String(monsNo).length > 3) {
		return `ZKN_FORM_$${monsNo}_${"0".repeat(formZeros)}${formNo}`;
	}
	return `ZKN_FORM_${"0".repeat(monZeros)}${monsNo}_${"0".repeat(
		formZeros,
	)}${formNo}`;
}

function removeDuplicates(pathDictionary) {
	const newPath = Array.from(new Set(pathDictionary));
	return newPath;
}

function removeDuplicateForms(evolutionPaths) {
	for (const pokemon in evolutionPaths) {
		evolutionPaths[pokemon].path = removeDuplicates(
			evolutionPaths[pokemon].path,
		);
	}
}

function processNextMon(adjacentNodes) {
	let nextMon = adjacentNodes[2];
	const nextForm = adjacentNodes[3];
	const formFormat = getFormFormat(nextMon, nextForm);

	if (formFormat in forms) {
		nextMon = forms[formFormat];
		return [parseInt(nextMon), nextForm];
	}
	return [parseInt(nextMon), nextForm];
}

function processCurrentMon(queue) {
	let currentMon = queue.shift();
	const currentForm = queue.shift();
	const formFormat = getFormFormat(currentMon, currentForm);

	if (formFormat in forms) {
		currentMon = forms[formFormat];
		return [parseInt(currentMon), currentForm];
	}

	return [parseInt(currentMon), currentForm];
}

function updateEvolvePaths(evolutionPaths, currentMon, currentMonPath) {
	evolutionPaths[currentMon].path.push(currentMon);
	evolutionPaths[currentMon].path = [
		...new Set(evolutionPaths[currentMon].path),
	];

	for (let i = 0; i < currentMonPath.length; i++) {
		evolutionPaths[currentMonPath[i]].path.push(currentMon);
		evolutionPaths[currentMonPath[i]].path = evolutionPaths[
			currentMonPath[i]
		].path.filter(
			(pokemon, evo_index) =>
				!new Set(
					evolutionPaths[currentMonPath[i]].path.slice(evo_index + 1),
				).has(pokemon),
		);
	}
}

function getSecondPathfindTargets(
	evolutionPaths,
	previousMon,
	currentMon,
	graph,
) {
	const targets = evolutionPaths[previousMon].targets;
	const currentMonPath = evolutionPaths[currentMon].path;
	const firstMonPath = evolutionPaths[currentMonPath[0]].path;
	const firstMonArray = graph[currentMonPath[0]].ar;

	if (!targets.includes(currentMon)) {
		if (previousMon === 265 || previousMon === 704) {
			// These are Wurmple and Goomy respectively
			evolutionPaths[265].targets = [266, 268]; // Wurmple targets are Silcoon and Cascoon
			/*
      Uncomment this for when Goomy is actually able to evolve into Hisuian Sliggo
      evolutionPaths[704].targets = [705, 1287; // Goomy targets are Sliggoo and Hisuian Sliggoo
      */
		} else if (firstMonPath.length > 3) {
			// This is for when a pokemon has a branching path at its second form and not its first form
			evolutionPaths[previousMon].targets.push(currentMon);
		} else if (firstMonArray.length > 5) {
			// This is for mons that have multiple evolutions in their first evo array like Burmy or Snorunt.
			evolutionPaths[previousMon].targets.push(currentMon);
		}
	}
}

function secondPathfind(pokemon, evolutionPaths, newQueue, graph) {
	while (newQueue.length > 0) {
		const [currentMon, currentForm] = processCurrentMon(newQueue);

		evolutionPaths[currentMon].path.push(parseInt(pokemon));
		const currentMonPath = evolutionPaths[currentMon].path;
		updateEvolvePaths(evolutionPaths, currentMon, currentMonPath);
		getSecondPathfindTargets(evolutionPaths, pokemon, currentMon, graph);
	}
}

function firstPathfind(pokemon, evolutionPaths, graph, queue, newQueue) {
	while (queue.length > 0) {
		const [currentMon, currentForm] = processCurrentMon(queue);

		const adjacentNodes = graph[currentMon].ar;
		if (adjacentNodes.length === 0) {
			continue;
		}
		const [nextMon, nextForm] = processNextMon(adjacentNodes);

		const targets = evolutionPaths[currentMon].targets;
		if (!targets.includes(nextMon)) {
			evolutionPaths[currentMon].targets.push(parseInt(nextMon));
		}

		evolutionPaths[nextMon].path = evolutionPaths[currentMon].path.concat(
			parseInt(nextMon),
		);
		for (let i = 2; i < adjacentNodes.length; i += 5) {
			// Increments by 5 starting on the third value which is the target evolution
			newQueue.push(adjacentNodes[i]);
			newQueue.push(adjacentNodes[i + 1]);

			secondPathfind(pokemon, evolutionPaths, newQueue, graph);

			newQueue.push(adjacentNodes[i]);
			newQueue.push(adjacentNodes[i + 1]);
		}

		queue.push(nextMon);
		queue.push(nextForm);
	}

	for (const extra of evolutionPaths[pokemon].path) {
		for (let i = 0; i < graph[extra].ar.length; i += 5) {
			evolutionPaths[pokemon].method.push(graph[extra].ar[i]);
		}
		evolutionPaths[pokemon].ar.push(graph[extra].ar);
	}
}

function startPathfinding(evolutionPaths, graph) {
	for (const pokemon in evolutionPaths) {
		const queue = [];
		queue.push(pokemon);
		queue.push(0);
		const newQueue = [];
		const evoPath = evolutionPaths[pokemon].path;
		if (!evoPath.includes(pokemon)) {
			evolutionPaths[pokemon].path.push(parseInt(pokemon));
		}
		firstPathfind(pokemon, evolutionPaths, graph, queue, newQueue);
	}
}

function evolutionPathfinding() {
	const graphData = EvolveTable;
	const graph = graphData.Evolve;
	const evolutionPaths = {};

	for (const node of graph) {
		evolutionPaths[node.id] = { path: [], method: [], ar: [], targets: [] };
	}

	startPathfinding(evolutionPaths, graph);

	removeDuplicateForms(evolutionPaths);
	return evolutionPaths;
}
