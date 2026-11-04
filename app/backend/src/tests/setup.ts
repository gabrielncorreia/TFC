// Tests sign their own tokens; the real secret only ever comes from the environment.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret';
// The suite logs in far more than the production limit of 10; the rate-limit test sets its own.
process.env.LOGIN_RATE_LIMIT = '1000';
