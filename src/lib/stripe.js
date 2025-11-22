import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'GenScript',
    version: '1.0.0',
    url: 'https://genscript.app',
  },
});

export default stripe;