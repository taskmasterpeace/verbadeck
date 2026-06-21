#!/usr/bin/env node

/**
 * VerbaDeck Launcher
 *
 * Simple Node.js launcher that can be compiled to .exe
 * Starts both servers and opens browser automatically
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n========================================');
console.log('   🎤 VerbaDeck Launcher');
console.log('   Voice-Powered Presentations');
console.log('========================================\n');

// Check if running from correct directory
const rootDir = __dirname;
const envPath = path.join(rootDir, '.env');
const packagePath = path.join(rootDir, 'package.json');

if (!fs.existsSync(packagePath)) {
  console.error('❌ ERROR: package.json not found!');
  console.error('   Make sure you\'re running this from the VerbaDeck folder.\n');
  process.exit(1);
}

// Check for .env file
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found!');
  console.error('   Please create .env file with your API keys.');
  console.error('   See .env.example for template.\n');
  process.exit(1);
}

// Check for node_modules
const nodeModulesPath = path.join(rootDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('   This may take a few minutes...\n');

  const install = spawn('npm', ['install'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  install.on('close', (code) => {
    if (code !== 0) {
      console.error('\n❌ Failed to install dependencies');
      process.exit(1);
    }
    startVerbaDeck();
  });
} else {
  startVerbaDeck();
}

function startVerbaDeck() {
  console.log('🚀 Starting VerbaDeck servers...\n');
  console.log('   [1/2] Server starting on port 3002...');
  console.log('   [2/2] Client starting on port 5173...\n');

  // Start both servers using npm run dev
  const devProcess = spawn('npm', ['run', 'dev'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  // Wait 8 seconds then open browser
  console.log('⏳ Waiting for servers to start...');
  console.log('   Browser will open in 8 seconds...\n');

  setTimeout(() => {
    console.log('🌐 Opening browser...\n');

    // Open browser based on platform
    const url = 'http://localhost:5173';
    const command = process.platform === 'win32'
      ? `start ${url}`
      : process.platform === 'darwin'
      ? `open ${url}`
      : `xdg-open ${url}`;

    exec(command, (error) => {
      if (error) {
        console.error('⚠️  Could not auto-open browser');
        console.log(`   Please open: ${url}\n`);
      } else {
        console.log('✅ VerbaDeck is running!\n');
        console.log('========================================');
        console.log('   Client: http://localhost:5173');
        console.log('   Server: http://localhost:3002');
        console.log('========================================\n');
        console.log('   Keep this window open while using VerbaDeck');
        console.log('   Press Ctrl+C to stop\n');
      }
    });
  }, 8000);

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping VerbaDeck...');
    devProcess.kill();
    process.exit(0);
  });

  // Keep process alive
  devProcess.on('close', (code) => {
    console.log(`\n✅ VerbaDeck stopped (exit code: ${code})`);
    process.exit(code);
  });
}
