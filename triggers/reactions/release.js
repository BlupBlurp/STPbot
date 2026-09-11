const { EmbedBuilder } = require("discord.js");

/**
 * @type {import('../../typings').TriggerCommand}
 */
module.exports = {
	data: {
		name: ["[release]"],
	},
	execute(message, args) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: "Team Lumi",
			})
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/1115345759496323173/1476702569350041682/STP.png?",
			)
			.setTitle("When does Shattered Platinum release?")
			.setDescription(
				`Shattered Platinum will release sometime (hopefully shortly) AFTER Re:Illuminated Platinum. <:LaterTm:1431334046532632647>\n\nCheck the [FAQ channel](https://discord.com/channels/912508046159261728/1350534230949756938) for more answers.`,
			)
			.setColor(0x00b0f4);

		message.channel.send({ embeds: [embed] });
	},
};
