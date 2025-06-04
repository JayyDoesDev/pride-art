import path from 'path';

import { ClientEvents } from 'discord.js';
import { sync } from 'glob';

import { Context } from '../classes/context';
import { Listener } from '../listeners/listener';

export default function (ctx: Context): void {
    try {
        let listeners: string[] = [];
        process.platform == 'linux'
            ? (listeners = sync('./listeners/*.js'))
            : (listeners = sync('./dist/listeners/*.js'));

        for (const listenerPath of listeners) {
            try {
                if (path.basename(listenerPath) === 'listener.js') continue; // Skip base class

                const filePath = path.resolve(listenerPath);
                const ListenerClass = require(filePath).default;

                if (ListenerClass && typeof ListenerClass === 'function') {
                    const listener: Listener<keyof ClientEvents> = new ListenerClass(ctx);
                    if (listener.once) {
                        ctx.once(listener.name, listener.execute.bind(listener));
                    } else {
                        ctx.on(listener.name, listener.execute.bind(listener));
                    }
                }
            } catch (error) {
                console.error(`Error loading listener ${listenerPath}: ${error.message}`);
            }
        }
    } catch (error) {
        console.error(`Error during glob operation: ${error.message}`);
    }
}
