#!/usr/bin/env node

/**
 * Quick Health Check Script
 * Verify all files exist and project is ready to run
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  // Backend Core
  'backend/server.js',
  'backend/package.json',
  'backend/interceptor/trustEngine.js',
  'backend/interceptor/wmvRunner.js',
  'backend/interceptor/fieldDecomposer.js',
  'backend/interceptor/mergeAssembler.js',
  'backend/interceptor/auditLogger.js',
  'backend/schema/patientRecord.schema.json',
  'backend/db/masterDb.js',
  'backend/db/trustDb.js',
  'backend/simulation/deviceSimulator.js',
  'backend/simulation/seedData.js',
  'backend/simulation/scenarios/scenario_normal.js',
  'backend/simulation/scenarios/scenario_attack.js',
  'backend/simulation/scenarios/scenario_laundering.js',
  
  // Frontend
  'frontend/package.json',
  'frontend/vite.config.js',
  'frontend/index.html',
  'frontend/src/main.jsx',
  'frontend/src/App.jsx',
  'frontend/src/index.css',
  'frontend/src/components/Dashboard.jsx',
  'frontend/src/components/DeviceTrustCard.jsx',
  'frontend/src/components/SyncFeed.jsx',
  'frontend/src/components/FieldDecisionTable.jsx',
  'frontend/src/components/PatientRecordViewer.jsx',
  'frontend/src/components/TrustEvolutionChart.jsx',
  'frontend/src/components/RiskTierBadge.jsx',
  
  // Documentation
  'README.md',
  'PROJECT_STRUCTURE.md',
  'API_TESTING.md',
  '.gitignore',
];

console.log('\n🏥 MediSync Shield - Health Check\n');
console.log('=' .repeat(50));

let missing = [];
let found = 0;

for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${file}`);
    found++;
  } else {
    console.log(`✗ ${file} [MISSING]`);
    missing.push(file);
  }
}

console.log('=' .repeat(50));
console.log(`\nResults: ${found}/${requiredFiles.length} files found\n`);

if (missing.length === 0) {
  console.log('✅ All files present! Project is ready.\n');
  console.log('Next steps:');
  console.log('  1. cd backend && npm install');
  console.log('  2. cd ../frontend && npm install');
  console.log('  3. Terminal 1: cd backend && npm start');
  console.log('  4. Terminal 2: cd frontend && npm run dev');
  console.log('  5. Open http://localhost:5173\n');
  process.exit(0);
} else {
  console.log(`❌ ${missing.length} file(s) missing!\n`);
  console.log('Missing files:');
  missing.forEach(f => console.log(`  - ${f}`));
  console.log('\nPlease regenerate the project.\n');
  process.exit(1);
}
