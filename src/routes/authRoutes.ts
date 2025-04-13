import express from 'express';
import * as authController from '../controller/authController';
import { authenticate } from '../middleware/authMiddleware';
import { sendWhatsAppMessage } from '../service/whatsappService';
import { sendEmail } from '../service/emailService';

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

// Messaging routes
router.post('/send-whatsapp', authenticate, async (req, res) => {
    try {
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({ message: 'Phone number and message are required' });
        }

        const success = await sendWhatsAppMessage(to, message);

        if (success) {
            return res.status(200).json({ message: 'WhatsApp message sent successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to send WhatsApp message' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/send-email', authenticate, async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;

        if (!to || !subject || (!text && !html)) {
            return res.status(400).json({ message: 'Email address, subject, and message content are required' });
        }

        const success = await sendEmail({ to, subject, text, html });

        if (success) {
            return res.status(200).json({ message: 'Email sent successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to send email' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;