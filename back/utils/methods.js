import axios from 'axios'

export function isUUID(uuid) {
    let s = "" + uuid;
    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    return s !== null;
}

export async function chatbot(msg, id) {
    const req = await axios.get(`http://api.brainshop.ai/get?bid=${process.env.CHATBOT_ID}&key=${process.env.CHATBOT_KEY}&uid=${id}&msg=${msg}`);
    return req.data.cnt;
}
