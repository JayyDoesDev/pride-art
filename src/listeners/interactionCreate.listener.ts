import {
    APIEmbed,
    AttachmentBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    Colors,
    ComponentType,
    MessageFlags,
    TextChannel,
} from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';
import { Nullable } from '../types';

import { Listener } from './listener';

export type User = {
    date: number;
    images: {
        banner: { doing: boolean; url: Nullable<string> };
        icon: { doing: boolean; url: Nullable<string> };
    };
    participating: boolean;
    status: string;
    submitted: boolean;
};

export default class InteractionCreateListener extends Listener<'interactionCreate'> {
    constructor(context: Context) {
        super(context, 'interactionCreate', false);
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.isButton()) return;

        const userId = interaction.user.id;
        const button = interaction.customId;
        const suffix = 'pride_art_competition';
        let user: User = {
            date: 0,
            images: { banner: { doing: false, url: null }, icon: { doing: false, url: null } },
            participating: false,
            status: '',
            submitted: false,
        };

        const parts = button.split('_');
        const action = parts.pop();
        const name = parts.pop();
        const uid = parts.pop();

        if (name == 'submit' && (action === 'approve' || action === 'deny')) {
            user = await this.ctx.store.getUser<User>({ user: uid }, suffix);
            const channel = await this.ctx.channels.fetch(this.ctx.env.get('vote_channel_id'));

            if (
                !channel ||
                (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildForum)
            ) {
                await interaction.reply({
                    content: 'Error! Contact the Ntts staff if you get this message!',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            if (user.status === 'approved' || user.status === 'denied') {
                await interaction.reply({
                    content: 'This user has already been reviewed!',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            if (action === 'approve') {
                const files: AttachmentBuilder[] = [];

                if (user.images.icon.url) {
                    const res = await fetch(user.images.icon.url);
                    const buffer = Buffer.from(await res.arrayBuffer());
                    files.push(new AttachmentBuilder(buffer, { name: 'icon.png' }));
                }

                if (user.images.banner.url) {
                    const res = await fetch(user.images.banner.url);
                    const buffer = Buffer.from(await res.arrayBuffer());
                    files.push(new AttachmentBuilder(buffer, { name: 'banner.png' }));
                }

                user.status = 'approved';
                await this.ctx.store.setUserKey({ user: uid }, user, suffix);

                const thread = await channel.threads.create({
                    autoArchiveDuration: 10080,
                    message: {
                        content: `> Vote below!\n> **Created by: ** <@${uid}>`,
                        files,
                    },
                    name: `Pride Art Submission`,
                    reason: 'New pride art submission',
                    type: ChannelType.PublicThread,
                });

                await thread.fetch();
                const firstMessage = (await thread.messages.fetch({ limit: 1 })).first();
                if (firstMessage) {
                    await firstMessage.react('👍');
                    await firstMessage.react('👎');
                }

                await interaction.reply({
                    content: 'This user has been approved!',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            } else {
                user.status = 'denied';
                await this.ctx.store.setUserKey({ user: uid }, user, suffix);
                await interaction.reply({
                    content: 'This user has been denied!',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        switch (button) {
            case `${suffix}_${interaction.user.id}_yes`:
                const alreadyParticipating = await this.ctx.store.findUser(
                    { user: userId },
                    suffix,
                );

                if (alreadyParticipating) {
                    await interaction.reply({
                        content: "It looks like you're already interested!",
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }

                await this.ctx.store.setUserKey<User>(
                    { user: userId },
                    {
                        date: Date.now(),
                        images: {
                            banner: { doing: false, url: null },
                            icon: { doing: false, url: null },
                        },
                        participating: true,
                        status: '',
                        submitted: false,
                    },
                    suffix,
                );

                await interaction.reply({
                    components: [
                        {
                            components: [
                                {
                                    customId: `${suffix}_${interaction.user.id}_icon`,
                                    label: 'Icon',
                                    style: ButtonStyle.Primary,
                                    type: ComponentType.Button,
                                },
                                {
                                    customId: `${suffix}_${interaction.user.id}_banner`,
                                    label: 'Banner',
                                    style: ButtonStyle.Secondary,
                                    type: ComponentType.Button,
                                },
                            ],
                            type: ComponentType.ActionRow,
                        },
                    ],
                    content:
                        "Great! Now tell me, would you like to upload an **icon or banner**? Don't worry, you can upload both of these if you'd like. But for now, choose one via the buttons below!",
                });
                break;
            case `${suffix}_${interaction.user.id}_icon`:
                user = await this.ctx.store.getUser<User>({ user: interaction.user.id }, suffix);
                const alreadyDidIcon = user.images.icon.doing && user.images.icon.url;

                if (alreadyDidIcon) {
                    await interaction.reply(
                        "Uh oh! it looks like you've already uploaded your icon!",
                    );
                    return;
                }

                user.images.icon.doing = true;
                await this.ctx.store.setUserKey({ user: interaction.user.id }, user, suffix);
                await interaction.reply(
                    'Alright! Now, what I would like you to do is send your **icon**! Before sending your icon, please make sure your icon follows the format of being **1:1 ratio, 500x500px**! Please include the word "icon" in your message and send only one attachment!',
                );
                break;

            case `${suffix}_${interaction.user.id}_banner`:
                user = await this.ctx.store.getUser<User>({ user: interaction.user.id }, suffix);
                const alreadyDidBanner = user.images.banner.doing && user.images.banner.url;

                if (alreadyDidBanner) {
                    await interaction.reply(
                        "Uh oh! it looks like you've already uploaded your banner!",
                    );
                    return;
                }

                user.images.banner.doing = true;
                await this.ctx.store.setUserKey({ user: interaction.user.id }, user, suffix);
                await interaction.reply(
                    'Alright! Now, what I would like you to do is send your **banner**! Before sending your banner, please make sure your banner follows the format of being **16:9 ratio, 1920x1080px**! Please include the word "banner" in your message and send only one attachment!',
                );
                break;

            case `${suffix}_${interaction.user.id}_submit`:
                user = await this.ctx.store.getUser<User>({ user: interaction.user.id }, suffix);
                if (user.submitted) {
                    await interaction.reply({
                        content: "You've already submitted your art! You can't submit again.",
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }

                const channel = await this.ctx.channels.fetch(
                    this.ctx.env.get('submission_channel_id'),
                );
                const hasImages = user.images.icon.url || user.images.banner.url;
                const submittedIcon = user.images.icon.url ? '✅' : '❌';
                const submittedBanner = user.images.banner.url ? '✅' : '❌';
                const attachments: APIEmbed[] = [];

                if (!channel || !(channel instanceof TextChannel)) {
                    await interaction.reply(
                        'Error! Contact the Ntts staff if you get this message!',
                    );
                    return;
                }

                if (!hasImages) {
                    await interaction.reply(
                        "I'm not sure how you got this submit button, but you need either an icon or banner in order to submit!",
                    );
                    return;
                }

                if (user.images.icon.url)
                    attachments.push({
                        color: Colors.DarkVividPink,
                        image: { url: user.images.icon.url },
                        title: 'Icon',
                    });
                if (user.images.banner.url)
                    attachments.push({
                        color: Colors.DarkVividPink,
                        image: { url: user.images.banner.url },
                        title: 'Banner',
                    });

                await channel.send({
                    components: [
                        {
                            components: [
                                {
                                    customId: `${suffix}_${interaction.user.id}_submit_approve`,
                                    label: 'Approve',
                                    style: ButtonStyle.Success,
                                    type: ComponentType.Button,
                                },
                                {
                                    customId: `${suffix}_${interaction.user.id}_submit_deny`,
                                    label: 'Deny',
                                    style: ButtonStyle.Danger,
                                    type: ComponentType.Button,
                                },
                            ],
                            type: ComponentType.ActionRow,
                        },
                    ],
                    embeds: [
                        {
                            color: Colors.DarkVividPink,
                            description: `> **Author:** ${interaction.user}(${interaction.user.id})\n> **Icon:** ${submittedIcon}\n> **Banner:** ${submittedBanner}`,
                            title: 'Submission',
                        },
                        ...attachments,
                    ],
                });

                user.submitted = true;
                await this.ctx.store.setUserKey({ user: interaction.user.id }, user, suffix);

                await interaction.reply(
                    'Submitted! You have now submitted your art for the pride art event! You can not submit anything else beyond this point!',
                );
                break;
            case `${suffix}_${interaction.user.id}_no`:
                interaction.reply({
                    content: 'No problem! If you change your mind, let us know!',
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
