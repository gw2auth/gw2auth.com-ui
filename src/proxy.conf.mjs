export default [
  {
    context: [
      '/api/',
      '/auth/',
      '/oauth2/',
      '/.well-known/oauth-authorization-server'
    ],
    target: 'http://127.0.0.1:9000',
    secure: false
  }
];