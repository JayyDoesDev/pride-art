import { Interactions, type Snowflake } from '@antibot/interactions';
import { ZillaCollection } from '@antibot/zilla';
import {
    ActivityType,
    ChatInputCommandInteraction,
    Client,
    ContextMenuCommandInteraction,
    IntentsBitField,
    Partials,
} from 'discord.js';

import { Command, Plugin } from '../define';

import { Env } from './env';

export class Context extends Client {
    public readonly env!: Env;
    public readonly interaction!: Interactions;
    public readonly interactions!: ZillaCollection<
        string,
        Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>
    >;
    public readonly plugin!: ZillaCollection<string, Plugin>;

    constructor() {
        super({
            allowedMentions: {
                parse: ['users'],
            },
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.GuildMessages,
            ],
            partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
            presence: {
                activities: [
                    {
                        name: "Type 'pride' in my dms!",
                        type: ActivityType.Playing,
                    },
                ],
            },
        });
        this.plugin = new ZillaCollection<string, Plugin>();
        this.interactions = new ZillaCollection<
            string,
            Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>
        >();
        this.interaction = new Interactions({
            botID: process.env.BOTID as unknown as Snowflake,
            botToken: process.env.TOKEN as unknown as string,
            debug: true,
            publicKey: process.env.PUBLIC_KEY as unknown as string,
        });
        this.env = new Env(
            {
                aliases: ['bot_id'],
                env: 'BOT_ID',
                required: true,
            },
            {
                aliases: ['token'],
                env: 'TOKEN',
                required: true,
            },
            {
                aliases: ['public_key'],
                env: 'PUBLIC_KEY',
                required: true,
            },
            {
                aliases: ['db', 'database_url'],
                env: 'MONGODB',
                required: true,
            },
        );
    }
}
