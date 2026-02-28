
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    REST,
    Routes,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ===== KONFIG =====
client.login(process.env.TOKEN);
const CLIENT_ID = "1475155632796602388";
const GUILD_ID = "1473733760511119470";
const VERIFIED_ROLE_ID = "1473737443508486430";
const IMAGE_URL = "https://ibb.co/wZNWB96Q";
// ===================

// ===== REJESTRACJA SLASH =====
const commands = [
    new SlashCommandBuilder()
        .setName("weryfikacja")
        .setDescription("Wysyła panel weryfikacji")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
    );
    console.log("Slash weryfikacja zarejestrowana");
})();

client.once("ready", () => {
    console.log(`Zalogowano jako ${client.user.tag}`);
});

// ===== INTERACTION =====
client.on("interactionCreate", async (interaction) => {

    try {

        // ===== PANEL =====
        if (interaction.isChatInputCommand() && interaction.commandName === "weryfikacja") {

            const embed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle("`👑 UNSEE SHOP • Weryfikacja`")
                .setDescription(
`🔐 Aby uzyskać pełny dostęp do serwera,
musisz przejść krótką weryfikację bezpieczeństwa.

> Kliknij przycisk poniżej i rozwiąż zadanie matematyczne.`
                )
                .setThumbnail(IMAGE_URL)
                .setFooter({ text: "System Weryfikacji • Ochrona przed botami" });

            const button = new ButtonBuilder()
                .setCustomId("verify_button")
                .setLabel("✅ Zweryfikuj się")
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            return interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }

        // ===== KLIK PRZYCISKU =====
        if (interaction.isButton() && interaction.customId === "verify_button") {

            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const answer = a + b;

            const modal = new ModalBuilder()
                .setCustomId(`verify_modal_${answer}`)
                .setTitle("Rozwiąż zadanie");

            const input = new TextInputBuilder()
                .setCustomId("math_answer")
                .setLabel(`${a} + ${b}`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row);

            return interaction.showModal(modal);
        }

        // ===== SPRAWDZANIE ODPOWIEDZI =====
        if (interaction.isModalSubmit() && interaction.customId.startsWith("verify_modal_")) {

            const correct = interaction.customId.split("_")[2];
            const userAnswer = interaction.fields.getTextInputValue("math_answer");

            if (userAnswer === correct) {

                const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
                await interaction.member.roles.add(role);

                return interaction.reply({
                    content: "✅ Weryfikacja zakończona pomyślnie!",
                    ephemeral: true
                });

            } else {

                return interaction.reply({
                    content: "❌ Błędna odpowiedź. Spróbuj ponownie.",
                    ephemeral: true
                });
            }
        }

    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);