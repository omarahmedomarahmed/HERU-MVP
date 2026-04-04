import crypto from 'crypto';

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;
const PAYMOB_ENABLED = process.env.PAYMOB_ENABLED === 'true';

const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function paymobFetch(path, body) {
  const res = await fetch(`${PAYMOB_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paymob API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function getAuthToken() {
  const data = await paymobFetch('/auth/tokens', { api_key: PAYMOB_API_KEY });
  return data.token;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a Paymob payment order and return the payment URL.
 *
 * @param {number} amountEgp  – total in EGP (NOT piasters)
 * @param {string} billNumber – HERU bill number (used as merchant_order_id)
 * @param {object} customer   – { first_name, last_name, email, phone }
 * @returns {{ orderId: string, paymentKey: string, paymentUrl: string }}
 */
export async function createPaymentOrder(amountEgp, billNumber, customer = {}) {
  if (!PAYMOB_ENABLED) {
    throw new Error(
      'Paymob payments are disabled. Set PAYMOB_ENABLED=true to enable.'
    );
  }

  // Step 1 – authentication token
  const authToken = await getAuthToken();

  // Step 2 – register order (amount in piasters)
  const amountCents = Math.round(amountEgp * 100);
  const orderData = await paymobFetch('/ecommerce/orders', {
    auth_token: authToken,
    delivery_needed: false,
    amount_cents: amountCents,
    currency: 'EGP',
    merchant_order_id: billNumber,
    items: [],
  });

  const orderId = orderData.id;

  // Step 3 – payment key
  const paymentKeyData = await paymobFetch('/acceptance/payment_keys', {
    auth_token: authToken,
    amount_cents: amountCents,
    expiration: 3600, // 1 hour
    order_id: orderId,
    billing_data: {
      first_name: customer.first_name || 'N/A',
      last_name: customer.last_name || 'N/A',
      email: customer.email || 'N/A',
      phone_number: customer.phone || 'N/A',
      apartment: 'N/A',
      floor: 'N/A',
      street: 'N/A',
      building: 'N/A',
      shipping_method: 'N/A',
      postal_code: 'N/A',
      city: 'N/A',
      country: 'EG',
      state: 'N/A',
    },
    currency: 'EGP',
    integration_id: parseInt(PAYMOB_INTEGRATION_ID, 10),
  });

  const paymentKey = paymentKeyData.token;
  const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

  return { orderId: String(orderId), paymentKey, paymentUrl };
}

/**
 * Verify the HMAC signature on a Paymob webhook/callback.
 *
 * Paymob sends a set of fields that must be concatenated in a specific order,
 * then hashed with HMAC-SHA512 using the HMAC secret.
 *
 * @param {object} data – the parsed callback body from Paymob
 * @param {string} hmac – the hmac query-param or header value
 * @returns {boolean}
 */
export function verifyHmac(data, hmac) {
  if (!PAYMOB_HMAC_SECRET) {
    console.warn('[paymob] HMAC secret not configured – skipping verification');
    return false;
  }

  // Paymob specifies these fields must be concatenated in this exact order
  const fields = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order.id',
    'owner',
    'pending',
    'source_data.pan',
    'source_data.sub_type',
    'source_data.type',
    'success',
  ];

  const concatenated = fields
    .map((field) => {
      const parts = field.split('.');
      let value = data;
      for (const part of parts) {
        value = value?.[part];
      }
      return String(value ?? '');
    })
    .join('');

  const computedHmac = crypto
    .createHmac('sha512', PAYMOB_HMAC_SECRET)
    .update(concatenated)
    .digest('hex');

  return computedHmac === hmac;
}

export { PAYMOB_ENABLED };
