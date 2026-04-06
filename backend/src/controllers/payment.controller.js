const { Client } = require('pg');
const { MonCashService, StripeService } = require('../utils/payment.service');
const axios = require('axios');

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

const getDbClient = () => {
    return new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME
    });
};

exports.initiatePayment = async (req, res) => {
    const { requestId, violationId, amount, method } = req.body;
    const userId = req.user.id;

    const client = getDbClient();
    try {
        await client.connect();
        
        const query = `
            INSERT INTO payments (request_id, violation_id, user_id, amount, payment_method, payment_status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING id
        `;
        const result = await client.query(query, [requestId, violationId, userId, amount, method]);
        const paymentId = result.rows[0].id;

        if (method === 'moncash') {
            const moncashResponse = await MonCashService.createPayment(paymentId.toString(), amount);
            await client.query('UPDATE payments SET transaction_id = $1 WHERE id = $2', [moncashResponse.token, paymentId]);
            
            return res.json({
                success: true,
                paymentUrl: moncashResponse.redirectUrl
            });
        } else if (method === 'credit_card') {
            const session = await StripeService.createCheckoutSession(paymentId, amount, !!requestId);
            await client.query('UPDATE payments SET transaction_id = $1 WHERE id = $2', [session.id, paymentId]);

            return res.json({
                success: true,
                paymentUrl: session.url
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment method' });
        }
    } catch (err) {
        console.error('InitiatePayment Error:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.end();
    }
};

exports.handleMonCashWebhook = async (req, res) => {
    // MonCash Webhook verification (for production)
    const transactionId = req.query.transaction_id || req.body.transactionId;
    res.json({ success: true });
};

exports.verifyPayment = async (req, res) => {
    const { paymentId } = req.params;
    const client = getDbClient();
    
    try {
        await client.connect();
        
        const resPayment = await client.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
        if (resPayment.rowCount === 0) return res.status(404).json({ success: false, message: 'Payment not found' });
        
        const payment = resPayment.rows[0];
        if (payment.payment_status === 'completed') return res.json({ success: true, status: 'completed' });
        
        if (payment.payment_method === 'credit_card') {
            const stripe = getStripe();
            if (stripe) {
                const session = await stripe.checkout.sessions.retrieve(payment.transaction_id);
                if (session.payment_status === 'paid') {
                    await updatePaymentStatus(client, paymentId, 'completed', payment.request_id, payment.violation_id);
                    return res.json({ success: true, status: 'completed' });
                }
            }
        } else if (payment.payment_method === 'moncash') {
            const token = await MonCashService.getToken();
            const url = process.env.MONCASH_MODE === 'sandbox'
                ? 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment'
                : 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment';
            
            try {
                // To retrieve transaction we usually use the orderId (paymentId) or transactionId (token)
                const response = await axios.post(url, {
                    orderId: paymentId.toString()
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.data.payment.status === 'successful') {
                     await updatePaymentStatus(client, paymentId, 'completed', payment.request_id, payment.violation_id);
                     return res.json({ success: true, status: 'completed' });
                }
            } catch (monError) {
                console.error('MonCash status check error:', monError.message);
            }
        }
        
        return res.json({ success: true, status: payment.payment_status });
    } catch (err) {
        console.error('VerifyPayment Error:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.end();
    }
};

async function updatePaymentStatus(client, paymentId, status, requestId, violationId) {
    await client.query('UPDATE payments SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, paymentId]);
    
    if (status === 'completed') {
        if (requestId) {
            await client.query("UPDATE service_requests SET status = $1, payment_status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $2", ['processing', requestId]);
        }
        if (violationId) {
            await client.query('UPDATE violations SET status = $1 WHERE id = $2', ['paid', violationId]);
        }
    }
}
