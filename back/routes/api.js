import { uploadImage } from "../utils/methods.js";
import { db } from "../main.js";

export default async function routes(fastify, options) {
    fastify.route({
        method: 'GET',
        url: '/',
        handler: async (req, rep) => {
            rep.send({ hello: "world" })
        }
    })


    fastify.route({
        method: 'POST',
        url: '/upload_image',
        handler: async (req, rep) => {
            const data = await req.file()

            const b64 = (await data.toBuffer()).toString('base64')
            const link = await uploadImage(b64)

            rep.send({ success: true, link })
        }
    })

    fastify.route({
        method: 'POST',
        url: '/get_user',
        handler: async (req, rep) => {
            const body = req.body

            const usersConnected = await db.usersConnected()
            const user = usersConnected.find(el => {
                let user = JSON.parse(el)
                return user.username === body.username
            });

            if (user) {
                const userData = JSON.parse(user)
                return rep.send({
                    success: true,
                    id: userData.id,
                    picture: userData.picture,
                    publicKey: userData.publicKey
                })
            }

            return rep.send({ success: false })
        }
    })
}
