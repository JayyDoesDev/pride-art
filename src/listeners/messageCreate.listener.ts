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
            if (await this.ctx.store.findUser({ user: message.author.id }, suffix)) return;
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
                submitted: user.submitted,
            };

            await this.ctx.store.setUserKey({ user: message.author.id }, newData, suffix);
            await message.reply(
                'Good job! You\'ve now set your **icon**! if you\'re done and have set a banner or don\'t want to submit a banner, say "done"! This will not work if you don\'t have your message set! (say "message" to say a message)',
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
                submitted: user.submitted,
            };

            await this.ctx.store.setUserKey({ user: message.author.id }, newData, suffix);
            await message.reply(
                'Good job! You\'ve now set your **banner**! if you\'re done and have set a icon or don\'t want to submit a icon, say "done"! This will not work if you don\'t have your message set! (say "message" to say a message)',
            );
            return;
        }

        if (message.content.toLowerCase().startsWith('message ')) {
            const user = await this.ctx.store.getUser<User>({ user: message.author.id }, suffix);

            if (!user) {
                await message.reply(
                    "Hmm... I couldn't find your registration. Try sending `pride` again to start!",
                );
                return;
            }

            const smallDesc = message.content.slice(8).trim();
            if (!smallDesc.length) {
                await message.reply('Please include a message after `message`.');
                return;
            }

            const newData: User = {
                ...user,
                small_desc: smallDesc,
            };

            await this.ctx.store.setUserKey({ user: message.author.id }, newData, suffix);
            await message.reply(
                "Awesome! I've saved your message. You're almost done—now just upload your icon or banner if you haven't yet, or say \"done\" if you're ready!",
            );
            return;
        }

        if (
            message.content === 'done' &&
            ((await this.ctx.store.getUser<User>({ user: message.author.id }, suffix))?.images
                .banner?.url ||
                (await this.ctx.store.getUser<User>({ user: message.author.id }, suffix))?.images
                    .icon?.url) &&
            (await this.ctx.store.getUser<User>({ user: message.author.id }, suffix))?.small_desc
        ) {
            const user = await this.ctx.store.getUser<User>({ user: message.author.id }, suffix);
            const submittedIcon = user.images.icon.url ? '✅' : '❌';
            const submittedBanner = user.images.banner.url ? '✅' : '❌';

            await message.reply({
                components: [
                    {
                        components: [
                            {
                                customId: `${suffix}_${message.author.id}_submit`,
                                label: 'Submit',
                                style: ButtonStyle.Primary,
                                type: ComponentType.Button,
                            },
                        ],
                        type: ComponentType.ActionRow,
                    },
                ],
                content: `**WARNING** You\'re about to submit! If you have everything you need, you can submit. This is a single submission for both the banner and icon! If you wish to submit, click the submit button below. Make sure to check the submission checklist of what you\'re submitting! \n**📝 Checklist:**\n**Icon:** ${submittedIcon}\n**Banner:** ${submittedBanner}`,
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
