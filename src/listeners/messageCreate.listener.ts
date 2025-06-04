import { ButtonStyle, ComponentType, Message } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';

import { Listener } from './listener';
import { User } from './interactionCreate.listener';

export default class MessageCreateListener extends Listener<'messageCreate'> {
    constructor(context: Context) {
        super(context, 'messageCreate', false);
    }

    public async execute(message: Message): Promise<void> {
        const suffix = 'pride_art_competition';
        if (!message.channel.isDMBased()) return;

        if (message.content === 'pride') {
            if (this.ctx.store.findUser({ user: message.author.id }, suffix)) return;
            message.reply({
                components: [
                    {
                        components: [
                            {
                                customId: `${suffix}_${message.author.id}_yes`,
                                label: 'I want to participate!',
                                style: ButtonStyle.Primary,
                                type: ComponentType.Button,
                            },
                            {
                                customId: `${suffix}_${message.author.id}_no`,
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

        if (
            message.content === 'icon' &&
            message.attachments.size === 1 &&
            (await this.ctx.store.getUser<User>({ user: message.author.id }, suffix))?.images.icon
                ?.doing &&
            !(await this.ctx.store.getUser<User>({ user: message.author.id }, suffix))?.images.icon
                ?.url
        ) {
            const iconUrl = message.attachments.first().url;
            const user = await this.ctx.store.getUser<User>({ user: message.author.id }, suffix);

            const newData: User = {
                date: user.date,
                images: {
                    banner: user.images.banner,
                    icon: { doing: user.images.icon.doing, url: iconUrl},
                },
                participating: user.participating,
                small_desc: user.small_desc,
            };

            await this.ctx.store.setUserKey({ user: message.author.id }, newData, suffix);
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
