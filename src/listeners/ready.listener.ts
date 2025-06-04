import { Context } from '../classes/context';
import { defineEvent } from '../define';

import { Listener } from './listener';

export default class ReadyListener extends Listener<'ready'> {
    constructor(context: Context) {
        super(context, 'ready', true);
    }

    public execute(): void {
        console.log(`${this.ctx.user.username} has logged in!`);
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
