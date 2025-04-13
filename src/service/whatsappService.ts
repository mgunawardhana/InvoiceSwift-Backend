import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

export const sendWhatsAppMessage = async (to: string, message: string): Promise<boolean> => {
    try {
        // Using WhatsApp Business API
        const response = await axios.post(
            `${WHATSAPP_API_URL}/messages`,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'text',
                text: {
                    body: message
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.status === 200;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return false;
    }
};
