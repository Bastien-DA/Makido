// Business errors: they say what went wrong, not how to answer it.
// The gRPC controller turns them into gRPC status codes

/** The request itself is wrong (missing order, negative amount…) */
export class InvalidPaymentError extends Error {
  override name = 'InvalidPaymentError';
}

/** The order already has a pending payment that cannot be resumed */
export class PaymentConflictError extends Error {
  override name = 'PaymentConflictError';
}

/** The payment provider failed or could not be reached */
export class ProviderUnavailableError extends Error {
  override name = 'ProviderUnavailableError';
}
