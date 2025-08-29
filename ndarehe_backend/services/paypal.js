const axios = require('axios')

async function generateAccessToken() {
    try{
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_CLIENT_SECRET
        }
    })

    return response.data.access_token
    } catch (error) {
        console.error('PayPal Auth Error:', error.response?.data || error.message);
        throw error;
    }
}

exports.createOrder = async () => {
    try {
        const accessToken = await generateAccessToken();

        const response = await axios({
            url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            data: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        items: [
                            {
                                name: 'Node.js Complete Course',
                                description: 'Node.js Complete Course with Express and MongoDB',
                                quantity: 1,
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: '100.00'
                                }
                            }
                        ],

                        amount: {
                            currency_code: 'USD',
                            value: '100.00',
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: '100.00'
                                }
                            }
                        }
                    }
                ],

                application_context: {
                    return_url: process.env.BASE_URL + '/complete-order',
                    cancel_url: process.env.BASE_URL + '/cancel-order',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                    brand_name: 'ndarehe.io'
                }
            })
        });

        return response.data.links.find(link => link.rel === 'approve').href;
    } catch (error) {
        console.error('PayPal Create Order Error:', error.response?.data || error.message);
        throw error;
    }
}

exports.capturePayment = async (orderId) => {
    try {
        const accessToken = await generateAccessToken();

        const response = await axios({
            url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        });

        return response.data;
    } catch (error) {
        console.error('PayPal Capture Payment Error:', error.response?.data || error.message);
        throw error;
    }
}
