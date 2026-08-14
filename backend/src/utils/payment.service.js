const axios = require('axios');

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn('Warning: STRIPE_SECRET_KEY is not defined in .env');
        return null;
    }
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

const MonCashService = {
    async getToken() {
        const auth = Buffer.from(`${process.env.MONCASH_CLIENT_ID}:${process.env.MONCASH_CLIENT_SECRET}`).toString('base64');
        const url = process.env.MONCASH_MODE === 'sandbox' 
            ? 'https://sandbox.moncashbutton.digicelgroup.com/Api/oauth/token' 
            : 'https://moncashbutton.digicelgroup.com/Api/oauth/token';
            
        try {
            const response = await axios.post(url, 'grant_type=client_credentials&scope=read,write', {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data.access_token;
        } catch (error) {
            console.error('MonCash Auth Error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with MonCash');
        }
    },

    async createPayment(orderId, amount) {
        const token = await this.getToken();
        const url = process.env.MONCASH_MODE === 'sandbox'
            ? 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/CreatePayment'
            : 'https://moncashbutton.digicelgroup.com/Api/v1/CreatePayment';

        try {
            console.log(`Initiating MonCash payment for Order: ${orderId}, Amount: ${amount}`);
            // NOTE: The return URL must be configured in the MonCash Business dashboard,
            // NOT in the API body. Set it to: ${process.env.FRONTEND_URL}/user/payment-success
            const response = await axios.post(url, {
                orderId,
                amount
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('MonCash API Response:', JSON.stringify(response.data, null, 2));

            if (!response.data.payment_token || !response.data.payment_token.token) {
                throw new Error('Invalid response from MonCash: missing token');
            }

            const redirectUrl = process.env.MONCASH_MODE === 'sandbox'
                ? `https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect?token=${response.data.payment_token.token}`
                : `https://moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect?token=${response.data.payment_token.token}`;
            
            return {
                redirectUrl,
                token: response.data.payment_token.token
            };
        } catch (error) {
            console.error('MonCash CreatePayment error details:', error.response?.data || error.message);
            throw new Error(`Erreur MonCash: ${error.response?.data?.message || error.message}`);
        }
    }
};

const StripeService = {
    async createCheckoutSession(paymentId, amount, isRequest = true) {
        const stripe = getStripe();
        if (!stripe) throw new Error('Stripe is not configured in this environment.');
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd', 
                        product_data: {
                            name: isRequest ? 'Service Request Payment' : 'Violation Payment',
                        },
                        unit_amount: Math.round(amount * 100), 
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/user/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/user/payment-cancelled?payment_id=${paymentId}`,
            client_reference_id: paymentId.toString(),
        });
        return session;
    }
};

module.exports = { MonCashService, StripeService };
