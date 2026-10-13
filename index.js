const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();
const PORT = process.env.PORT || 8080;

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

if (!APP_ID || !APP_CERTIFICATE) {
  console.error('Missing APP_ID or APP_CERTIFICATE environment variables');
  process.exit(1);
}

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'prepayog-token-server' });
});

app.post('/rtc', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  const { channelName, uid, tokenType } = req.body;

  if (!channelName) {
    return res.status(400).json({ error: 'channelName is required' });
  }
  if (uid === undefined || uid === null) {
    return res.status(400).json({ error: 'uid is required' });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  let token;
  if (tokenType === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpiredTs
    );
  } else {
    token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpiredTs
    );
  }

  res.json({ token, uid, channelName });
});

app.options('/rtc', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Token server listening on port ${PORT}`);
});