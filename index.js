require('dotenv/config');
const cron = require('node-cron');
const express = require('express');
const axios = require('axios');
const twilio = require('twilio');

const app = express();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  SEND_SMS_TO,
} = process.env;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

cron.schedule('0 */10 * * * *', async () => {
  try {
    const { data } = await axios.get(
      'https://irembo.gov.rw/irembo/rest/public/police/request/exam/schedules/location-format-type',
      {
        headers: {
          districtId: '29a049e2-ca22-4f0d-a147-03a1ef79c2af',
          examFormat: 'COMPUTERBASED',
          examType: 'THEORY',
          NLS: 'Kinyarwanda',
        },
      }
    );
    console.log(('>>>>>>>>>>>>>>IREMBO RESPONSE RESULTS:', data));
    if (
      data?.data &&
      data?.data?.resultCode !== '404' &&
      data?.data?.dlExamSchedules
    ) {
      client.messages
        .create({
          to: SEND_SMS_TO,
          from: TWILIO_PHONE_NUMBER,
          body: `status: ${data?.data?.resultCode}. message: ${data?.data?.message}`,
        })
        .then((res) => console.log(res));
    }
  } catch (error) {
    console.log(error);
  }
});
app.get('/', (_req, res) =>
  res.status(200).json({
    message: 'Welcome to Irembo notifier !',
    data: {
      message:
        'I am not supposed to return anything really, but for our information this App is perfectly working and Luc will be getting sms every 10 minutes. Feel free to reach out to him on via email: jean.abayo@gmial.com',
    },
  })
);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app listening on port: ${PORT}`);
});
