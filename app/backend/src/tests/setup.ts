// Tests sign their own tokens; the real secret only ever comes from the environment.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret';
