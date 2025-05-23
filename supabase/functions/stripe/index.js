// index.js
import Stripe from 'stripe';

const stripe = new Stripe('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'); // Remplace par ta vraie clé

const productId = 'prod_SLwxDxY64f3V8I';

async function listPricesForProduct(productId) {
  try {
    const prices = await stripe.prices.list({
      product: productId,
      limit: 100,
    });

    if (prices.data.length === 0) {
      console.log('Aucun price_id trouvé pour ce produit.');
      return;
    }

    prices.data.forEach(price => {
      console.log(`Price ID : ${price.id}`);
      console.log(`  Montant : ${price.unit_amount} ${price.currency.toUpperCase()}`);
      console.log(`  Récurrent : ${price.recurring ? 'Oui' : 'Non'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Erreur :', error.message);
  }
}

listPricesForProduct(productId);
