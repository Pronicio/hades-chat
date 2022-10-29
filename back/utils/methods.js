import axios from 'axios'
import FormData from 'form-data';
import { readFileSync } from 'fs'

export function isUUID(uuid) {
    let s = "" + uuid;
    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    return s !== null;
}

export async function chatbot(msg, id) {
    try {
        const req = await axios.get(`http://api.brainshop.ai/get?bid=${process.env.CHATBOT_ID}&key=${process.env.CHATBOT_KEY}&uid=${id}&msg=${msg}`);
        return JSON.stringify({ action: "from", from: "chatbot", msg: req.data.cnt });
    } catch (e) {
        console.error(e)
    }
}

export async function uploadImage(b64) {
    const data = new FormData();
    data.append('image', b64);

    const config = {
        method: 'post',
        url: 'https://api.imgur.com/3/image',
        headers: {
            'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
            ...data.getHeaders()
        },
        data : data
    };

    const req = await axios(config)
        .catch(function (error) { console.log(error); });

    return req.data.data.link
}
