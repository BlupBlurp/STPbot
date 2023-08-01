const { abilityNames, abilityInfo } = require("../../lumibot/__gamedata");

function getEncounterLocations(monsNo) {
	const debug_file_path = ""; // Add the correct path to your debug folder if needed
	const encounterFile = path.join(debug_file_path, "encounter_locations.json");

	// Read the encounter data from the JSON file
	const data = JSON.parse(fs.readFileSync(encounterFile, "utf8"));

	// If the Pokémon number is not found, return an empty array
	if (!data[monsNo]) {
		return [];
	}

	const locations = [];

	// Process each location and store the encounter details in the 'locations' array
	const sorted_data = sort_dicts_by_keys_and_list(
		data[monsNo],
		"routeName",
		constants.DOCS_ZONE_ORDER,
	);
	for (const location of sorted_data) {
		const enc_type = location["encounterType"];
		let enc_location = location["routeName"];

		// Rename the encounter types
		const encounterTypeMap = {
			[constants.REGULAR_ENC]: "Grass",
			[constants.SWARM]: "Swarm",
			[constants.RADAR]: "Radar",
			[constants.SURF_ENC]: "Surfing",
			[constants.OLD_ENC]: "Old Rod",
			[constants.GOOD_ENC]: "Good Rod",
			[constants.SUPER_ENC]: "Super Rod",
		};
		enc_type = encounterTypeMap[enc_type] || enc_type;

		const enc_level = location["maxLevel"];
		let enc_rate = location["encounterRate"];

		// Convert the encounter rate to a numerical value
		if (enc_rate === "morning") {
			enc_rate = 10;
			enc_type = "Morning";
		} else {
			enc_rate = parseInt(enc_rate.split("%")[0]);
		}

		// Store the encounter details in the 'locations' array
		locations.push({
			location: enc_location,
			type: enc_type,
			level: enc_level,
			rate: `${enc_rate}%`,
		});
	}

	return locations;
}

module.exports = { getEncounterLocations };
