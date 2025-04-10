const axios = require('axios');
require('dotenv').config();
const twilio = require('twilio');

const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const passStr = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  const password = Buffer.from(passStr).toString('base64');
  return { password, timestamp };
};



// Set up Twilio client
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send SMS notification to the customer
const sendSmsNotification = async (phone, message) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio number
      to: phone,
    });
    console.log('SMS sent successfully!');
  } catch (err) {
    console.error('Error sending SMS:', err);
  }
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

    // Check if payment was successful (simulate payment confirmation)
    if (stkRes.data.ResponseCode === '0') {
        // Send SMS confirmation to the customer
        await sendSmsNotification(phone, `Your payment of KES ${amount} for FlowerShop order was successful! Thank you for shopping with us.`);
    }

    res.json(stkRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'M-PESA STK Push failed' });
  }
};

module.exports = { initiateStkPush };
