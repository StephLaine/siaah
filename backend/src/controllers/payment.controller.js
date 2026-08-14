const { pool } = require('../config/db');
const { MonCashService, StripeService } = require('../utils/payment.service');
const axios = require('axios');

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

exports.initiatePayment = async (req, res) => {
    const { requestId, violationId, amount, method } = req.body;
    const userId = req.user.id;

    try {
        const query = `
            INSERT INTO payments (request_id, violation_id, user_id, amount, payment_method, payment_status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING id
        `;
        const result = await pool.query(query, [requestId, violationId, userId, amount, method]);
        const paymentId = result.rows[0].id;

        if (method === 'moncash') {
            const moncashOrderId = `${paymentId}_${Date.now()}`;
            const moncashResponse = await MonCashService.createPayment(moncashOrderId, amount);
            await pool.query('UPDATE payments SET transaction_id = $1 WHERE id = $2', [moncashOrderId, paymentId]);
            
            return res.json({
                success: true,
                paymentUrl: moncashResponse.redirectUrl,
                paymentId: paymentId
            });
        } else if (method === 'credit_card') {
            const session = await StripeService.createCheckoutSession(paymentId, amount, !!requestId);
            await pool.query('UPDATE payments SET transaction_id = $1 WHERE id = $2', [session.id, paymentId]);

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
    }
};

exports.handleMonCashWebhook = async (req, res) => {
    // MonCash can send orderId or transactionId in various forms
    const orderId = req.query.orderId || req.query.order_id || req.body.orderId || req.body.order_id;
    const transactionId = req.query.transactionId || req.query.transaction_id || req.body.transactionId || req.body.transaction_id;
    
    console.log(`MonCash Webhook received: transactionId=${transactionId}, orderId=${orderId}`);

    const lookupId = orderId || transactionId;
    if (!lookupId) {
        return res.status(400).json({ success: false, message: 'Missing orderId or transactionId' });
    }

    try {
        const token = await MonCashService.getToken();

        let paymentStatus = null;

        // Use RetrieveOrderPayment when we have an orderId
        if (orderId) {
            const url = process.env.MONCASH_MODE === 'sandbox'
                ? 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment'
                : 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment';
            const response = await axios.post(url, { orderId: orderId.toString() }, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log('MonCash RetrieveOrderPayment response:', JSON.stringify(response.data));
            paymentStatus = response.data.payment?.status;
        } else {
            // Fallback: use RetrieveTransactionPayment when only transactionId is available
            const url = process.env.MONCASH_MODE === 'sandbox'
                ? 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment'
                : 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment';
            const response = await axios.post(url, { transactionId: transactionId.toString() }, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log('MonCash RetrieveTransactionPayment response:', JSON.stringify(response.data));
            paymentStatus = response.data.payment?.status;
        }

        if (paymentStatus === 'successful') {
            const rawId = orderId || transactionId;
            const dbPaymentId = rawId && rawId.includes('_') ? rawId.split('_')[0] : rawId;
            const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1 OR transaction_id = $2', [isNaN(dbPaymentId) ? 0 : parseInt(dbPaymentId), rawId]);
            if (paymentResult.rowCount > 0) {
                const payment = paymentResult.rows[0];
                if (payment.payment_status !== 'completed') {
                    await updatePaymentStatus(pool, payment.id, 'completed', payment.request_id, payment.violation_id);
                    console.log(`Payment PAY-${payment.id} successfully completed via Webhook.`);
                }
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error('MonCash Webhook Processing Error:', err.response?.data || err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyPayment = async (req, res) => {
    const { paymentId } = req.params;
    
    try {
        const resPayment = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
        if (resPayment.rowCount === 0) return res.status(404).json({ success: false, message: 'Payment not found' });
        
        const payment = resPayment.rows[0];
        if (payment.payment_status === 'completed') return res.json({ success: true, status: 'completed' });
        
        if (payment.payment_method === 'credit_card') {
            const stripe = getStripe();
            if (stripe) {
                const session = await stripe.checkout.sessions.retrieve(payment.transaction_id);
                if (session.payment_status === 'paid') {
                    await updatePaymentStatus(pool, paymentId, 'completed', payment.request_id, payment.violation_id);
                    return res.json({ success: true, status: 'completed' });
                }
            }
        } else if (payment.payment_method === 'moncash') {
            try {
                const token = await MonCashService.getToken();
                const moncashOrderId = payment.transaction_id || paymentId.toString();
                // Use RetrieveOrderPayment (lookup by unique moncashOrderId)
                const url = process.env.MONCASH_MODE === 'sandbox'
                    ? 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment'
                    : 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment';
                
                const response = await axios.post(url, {
                    orderId: moncashOrderId
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('MonCash RetrieveOrderPayment response:', JSON.stringify(response.data));
                
                if (response.data.payment && response.data.payment.status === 'successful') {
                    await updatePaymentStatus(pool, paymentId, 'completed', payment.request_id, payment.violation_id);
                    return res.json({ success: true, status: 'completed' });
                }
            } catch (monError) {
                const status = monError.response?.status;
                // 404 or 500 from MonCash Sandbox while payment is pending is expected before the user completes OTP
                if (status !== 404 && status !== 500) {
                    console.error('MonCash status check error:', monError.response?.data || monError.message);
                }
            }
        }
        
        return res.json({ success: true, status: payment.payment_status });
    } catch (err) {
        console.error('VerifyPayment Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

async function updatePaymentStatus(clientOrPool, paymentId, status, requestId, violationId) {
    await clientOrPool.query('UPDATE payments SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, paymentId]);
    
    if (status === 'completed') {
        if (requestId) {
            await clientOrPool.query("UPDATE service_requests SET status = $1, payment_status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $2", ['processing', requestId]);
        }
        if (violationId) {
            await clientOrPool.query('UPDATE violations SET status = $1 WHERE id = $2', ['paid', violationId]);
        }
    }
}
