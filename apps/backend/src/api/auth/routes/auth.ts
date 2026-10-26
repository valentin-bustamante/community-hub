export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/forgot-password-resend',
      handler: 'auth.forgotPassword',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/reset-password-resend',
      handler: 'auth.resetPassword',
      config: {
        auth: false,
      },
    },
  ],
};
