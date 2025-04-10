const axios = require('axios');
require('dotenv').config();

const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const passStr = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  const password = Buffer.from(passStr).toString('base64');
  return { password, timestamp };
};

const initiateStkPush = async (req, res) => {
  const { phone, amount } = req.body;
  const { password, timestamp } = generatePassword();

  try {
    const tokenRes = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        auth: {
          username: process.env.MPESA_CONSUMER_KEY,
          password: process.env.MPESA_CONSUMER_SECRET
        }
      }
    );
    const token = tokenRes.data.access_token;

    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: 'ProductShop',
        TransactionDesc: 'Product Order Payment'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(stkRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'M-PESA STK Push failed' });
  }
};

module.exports = { initiateStkPush };
