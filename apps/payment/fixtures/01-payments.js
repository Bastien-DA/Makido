/* global db, ObjectId */
// Demo payments, inserted by the MongoDB image on the first start of
// payment-db (empty volume only). Fake order ids and fake Stripe session ids:
// they do not exist at Stripe, they only show the possible states.

const ORDER_PAID = '6660000000000000000000a1';
const ORDER_RETRIED = '6660000000000000000000a2';
const ORDER_WAITING = '6660000000000000000000a3';
const MINUTE = 60 * 1000;

function payment(id, minutesAgo, orderId, amount, status, externalId) {
  const createdAt = new Date(Date.now() - minutesAgo * MINUTE);
  // A final payment was updated when its callback arrived, a few minutes later
  const updatedAt =
    status === 'PENDING'
      ? createdAt
      : new Date(createdAt.getTime() + 3 * MINUTE);

  return {
    _id: ObjectId(id),
    amount,
    createdAt,
    currency: 'eur',
    externalId,
    orderId,
    status,
    updatedAt,
  };
}

db.getSiblingDB('payment').payments.insertMany([
  // Paid at the first try
  payment(
    '667000000000000000000001',
    120,
    ORDER_PAID,
    1250,
    'SUCCEEDED',
    'cs_test_fixture_paid',
  ),
  // First session expired, the second one was paid
  payment(
    '667000000000000000000002',
    1500,
    ORDER_RETRIED,
    2390,
    'FAILED',
    'cs_test_fixture_expired',
  ),
  payment(
    '667000000000000000000003',
    60,
    ORDER_RETRIED,
    2390,
    'SUCCEEDED',
    'cs_test_fixture_retried',
  ),
  // The customer is on the Stripe page: still waiting for the callback
  payment(
    '667000000000000000000004',
    5,
    ORDER_WAITING,
    890,
    'PENDING',
    'cs_test_fixture_waiting',
  ),
]);
