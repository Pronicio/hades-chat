const {createClient} = require("redis");

module.exports = class {
    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URI
        });

        this.client.on('error', (err) => console.log('Redis Client Error', err));
        this.client.connect().then();
    }

    //TODO: Finish redis
    async test() {
        const value = await this.client.rPush('clients', '{OBJECT}')
        const result = await this.client.lRange('clients', 0, -1)
        console.log(result);
        return result
    }
}
