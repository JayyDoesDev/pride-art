import { ButtonStyle, ComponentType, Message } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';

import { Listener } from './listener';

export default class MessageCreateListener extends Listener<'messageCreate'> {
    constructor(context: Context) {
        super(context, 'messageCreate', false);
    }

    public execute(message: Message): Promise<void> | void {
        if (!message.channel.isDMBased()) return;
        if (message.content === 'pride') {
            message.reply({
                components: [
                    {
                        components: [
                            {
                                customId: `pride_art_competition_${message.author.id}_yes`,
                                label: 'I want to participate!',
                                style: ButtonStyle.Primary,
                                type: ComponentType.Button,
                            },
                            {
                                customId: `pride_art_competition_${message.author.id}_no`,
                                label: 'No thank you!',
                                style: ButtonStyle.Danger,
                                type: ComponentType.Button,
                            },
                        ],
                        type: ComponentType.ActionRow,
                    },
                ],
                content:
                    'Hello! Looks like you want to participate in the **Pride Month Art Competition 🏳️‍🌈**! Is that true?',
            });
        }
    }

    public toEvent() {
        return defineEvent({
            event: {
                name: this.name,
                once: this.once,
            },
            on: this.execute.bind(this),
        });
    }
}
