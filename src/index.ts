import { config } from 'dotenv';

import { Context } from './classes/context';
config();

const context = new Context();
context.env.validate();

async function main() {
    try {
        await Promise.all(
            ['event', 'listener'].map(async (x) => {
                console.log(`Loading ${x} handlers...`);
                const handlerModule = await import(`./handlers/${x}`);
                return handlerModule.default(context);
            }),
        );

        await context.login(context.env.get('token'));
    } catch (error) {
        console.error(`Error during initialization: ${error.message}`);
    }
}

process
    .on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    })
    .on('uncaughtException', (error) => {
        console.error('Uncaught Exception thrown:', error);
    });

main().catch(console.error);
