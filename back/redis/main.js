import { createClient } from "redis";

export default class {
    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URI
        });

        this.client.on('error', (err) => console.log('Redis Client Error', err));
        this.client.connect().then(async () => {
            await this._reset()
        });
    }

    async _reset() {
        await this.client.del('clients')
        await this.client.flushAll()
    }

    async newUser(data) {
        return await this.client.rPush('clients', JSON.stringify(data))
    }

    async leaveUser(data) {
        try {
            return await this.client.lRem('clients', 0, data);
        } catch (e) {
            console.error(e)
        }
    }

    async usersConnected() {
        return await this.client.lRange('clients', 0, -1)
    }
}
