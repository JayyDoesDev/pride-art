import { ButtonInteraction, ButtonStyle, ComponentType, MessageFlags } from 'discord.js';

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
    small_desc: string;
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
            small_desc: null,
        };

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
                        small_desc: null,
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
