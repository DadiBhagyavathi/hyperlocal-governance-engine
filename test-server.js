const app = require('./src/app');
const env = require('./src/config/env');

console.log('Testing server startup...');
console.log('Port:', env.port);
console.log('Environment:', env.nodeEnv);

const server = app.listen(env.port, () => {
  console.log('✅ Server started successfully on port', env.port);
  console.log('🌐 Open: http://localhost:' + env.port);
  console.log('\nPress Ctrl+C to stop');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});
