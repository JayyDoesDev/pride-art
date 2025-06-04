import { ButtonStyle, ComponentType, Message } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';

import { User } from './interactionCreate.listener';
import { Listener } from './listener';

export default class MessageCreateListener extends Listener<'messageCreate'> {
    constructor(context: Context) {
        super(context, 'messageCreate', false);
    }

    public async execute(message: Message): Promise<void> {
        const suffix = 'pride_art_competition';
        if (!message.channel.isDMBased()) return;

        if (message.content === 'pride') {
            if (this.ctx.store.findUser({ user: message.author.id }, suffix)) return;
            await message.reply({
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
            return;
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
                    icon: { doing: user.images.icon.doing, url: iconUrl },
                },
                participating: user.participating,
                small_desc: user.small_desc,
            };

            await this.ctx.store.setUserKey({ user: message.author.id }, newData, suffix);
            await message.reply(
                'Good job! You\'ve now set your **icon**! if you\'re done and have set a banner or don\'t want to submit a banner, say "done"! This will not work if you don\'t have your description set! (say "description" to say a description)',
            );
            return;
        }

        if (
            message.content === 'banner' &&
            message.attachments.size === 1 &&
            (await this.ctx.store.getUser<User>({ user: message.author.id }, suffix))?.images.banner
                ?.doing &&
            !(await this.ctx.store.getUser<User>({ user: message.author.id }, suffix))?.images
                .banner?.url
        ) {
            const bannerUrl = message.attachments.first().url;
            const user = await this.ctx.store.getUser<User>({ user: message.author.id }, suffix);

            const newData: User = {
                date: user.date,
                images: {
                    banner: { doing: user.images.banner.doing, url: bannerUrl },
                    icon: user.images.icon,
                },
                participating: user.participating,
                small_desc: user.small_desc,
            };

            await this.ctx.store.setUserKey({ user: message.author.id }, newData, suffix);
            await message.reply(
                'Good job! You\'ve now set your **banner**! if you\'re done and have set a icon or don\'t want to submit a icon, say "done"! This will not work if you don\'t have your description set! (say "description" to say a description)',
            );
            return;
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
