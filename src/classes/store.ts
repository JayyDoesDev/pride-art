import { Snowflake } from '@antibot/interactions';
import { Redis } from 'ioredis';

import { Context } from './context';

type GuildSnowflake = Record<'guild', Snowflake>;
type KeySuffix = string;
type UserSnowflake = Record<'user', Snowflake>;

export class Store extends Redis {
    #connected: boolean = false;
    #ctx: Context;

    constructor(protected ctx: Context) {
        super({
            host: ctx.env.get('redis_host'),
            port: ctx.env.get('redis_port') as number,
            retryStrategy: (times) => {
                console.error(`Redis retry attempt ${times}`);
                return Math.min(times * 100, 3000);
            },
        });
        this.#ctx = ctx;

        this.on('connect', () => {
            console.log('Redis connected');
            this.#connected = true;
        });

        this.on('error', (err) => {
            console.error('Redis error:', err);
            this.#connected = false;
        });
    }

    public deleteGuild(options: GuildSnowflake | UserSnowflake, suffix?: KeySuffix): void {
        this.del(this.createKey(options, suffix));
    }

    public async findGuild(options: GuildSnowflake, suffix?: KeySuffix): Promise<boolean> {
        return (await this.getGuild(options, suffix)) !== null;
    }

    public async findUser(options: UserSnowflake, suffix?: KeySuffix): Promise<boolean> {
        return (await this.getUser(options, suffix)) !== null;
    }

    public async getGuild<T>(options: GuildSnowflake, suffix?: KeySuffix): Promise<null | T> {
        await this.ensureConnection();
        const key = this.createKey(options, suffix);

        try {
            let raw = await this.get(key);

            if (!raw && options.guild) {
                const legacyKey = `"${options.guild}"`;
                console.log('Key not found, trying legacy key:', legacyKey);
                raw = await this.get(legacyKey);

                if (raw) {
                    console.log('Found data with legacy key, migrating...');
                    await this.set(key, raw);
                    await this.del(legacyKey);
                }
            }

            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch (err) {
            console.error('Error in getGuild:', err);
            return null;
        }
    }

    public async getUser<T>(options: UserSnowflake, suffix?: KeySuffix): Promise<null | T> {
        await this.ensureConnection();
        const key = this.createKey(options, suffix);

        try {
            const raw = await this.get(key);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch (err) {
            console.error('Error in getUser:', err);
            return null;
        }
    }

    public async guildExists(
        options: GuildSnowflake | UserSnowflake,
        suffix?: KeySuffix,
    ): Promise<number> {
        await this.ensureConnection();
        return this.exists(this.createKey(options, suffix));
    }

    public async setForeignKey<T>(
        options: GuildSnowflake | UserSnowflake,
        data: T,
        suffix?: KeySuffix,
    ): Promise<void> {
        await this.ensureConnection();
        const key = this.createKey(options, suffix);
        await this.set(key, JSON.stringify(data));
    }

    public setKey<T>(
        options: GuildSnowflake | UserSnowflake,
        keys: T[] = [],
        suffix?: KeySuffix,
    ): void {
        const key = this.createKey(options, suffix);
        this.set(key, JSON.stringify(keys));
    }

    public async setUserKey<T>(options: UserSnowflake, data: T, suffix?: KeySuffix): Promise<void> {
        await this.ensureConnection();
        const key = this.createKey(options, suffix);
        await this.set(key, JSON.stringify(data));
    }

    private createKey(options: GuildSnowflake | UserSnowflake, suffix?: KeySuffix): string {
        if ('guild' in options) {
            return `${options.guild}${suffix ? `_${suffix}` : ''}`;
        }
        return `${options.user}${suffix ? `_${suffix}` : ''}`;
    }

    private async ensureConnection(): Promise<void> {
        if (!this.#connected) {
            console.log('Waiting for Redis connection...');
            await new Promise<void>((resolve) => {
                if (this.#connected) resolve();
                else this.once('connect', () => resolve());
            });
        }
    }
}
