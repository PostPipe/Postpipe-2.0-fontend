import * as dotenv from 'dotenv';
dotenv.config();

async function getProducts() {
  const DodoPayments = require('dodopayments').default;
  const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode',
  });

  try {
      const products = await client.products.list();
      console.log(JSON.stringify(products, null, 2));
  } catch (error) {
      console.error(error);
  }
}
getProducts();
