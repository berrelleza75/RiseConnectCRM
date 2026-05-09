import express from 'express';
import twilio from 'twilio';

const router = express.Router();

const accountSid  = process.env.TWILIO_ACCOUNT_SID;
const apiKey      = process.env.TWILIO_API_KEY;
const apiSecret   = process.env.TWILIO_API_SECRET;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const AccessToken   = twilio.jwt.AccessToken;
const VoiceGrant    = AccessToken.VoiceGrant;

router.get('/token', (req, res) => {
    try {
        const token = new AccessToken(accountSid, apiKey, apiSecret, {
            identity: 'agent',
            ttl: 3600,
        });
        const grant = new VoiceGrant({
            outgoingApplicationSid: twimlAppSid,
            incomingAllow: false,
        });
        token.addGrant(grant);
        res.json({ token: token.toJwt() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
