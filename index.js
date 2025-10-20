// Redirect to server directory
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting GameZone Social Backend...');
console.log('Redirecting to server directory...');

// Change to server directory and start the server
process.chdir(path.join(__dirname, 'server'));

// Start the server
const server = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});
