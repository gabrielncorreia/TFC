const bcrypt = require('bcryptjs');

// The fallback hashes are public local-development logins; production sets its own passwords.
const password = (envName, devHash) => {
  if (process.env[envName]) return bcrypt.hashSync(process.env[envName], 10);
  if (process.env.NODE_ENV === 'production') throw new Error(`${envName} must be set`);
  return devHash;
};

module.exports = {
  up: async (queryInterface) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert('users', [
      {
        username: 'Admin',
        role: 'admin',
        email: 'admin@admin.com',
        password: password('ADMIN_PASSWORD', '$2a$08$xi.Hxk1czAO0nZR..B393u10aED0RQ1N3PAEXQ7HxtLjKPEZBu.PW'), // local: secret_admin
      },
      {
        username: 'User',
        role: 'user',
        email: 'user@user.com',
        password: password('USER_PASSWORD', '$2a$08$Y8Abi8jXvsXyqm.rmp0B.uQBA5qUz7T6Ghlg/CvVr/gLxYj5UAZVO'), // local: secret_user
      },
    ], {});
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    await queryInterface.bulkDelete('users', null, {});
  },
};
