const axios = require('axios');
require('dotenv').config();

const testInitiate = async () => {
    try {
        // We need a real token. Let's assume we can get one or bypass check for test.
        // Actually I'll just call the service directly.
        const { MonCashService } = require('./src/utils/payment.service');
        
        console.log('Testing MonCash creation directly...');
        const res = await MonCashService.createPayment('TEST_' + Date.now(), 2500);
        console.log('Success!', res);
    } catch (err) {
        console.error('Test Failed:', err.message);
    }
};

testInitiate();
