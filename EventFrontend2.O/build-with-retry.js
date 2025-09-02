const { execSync } = require('child_process');

// Configuration
const MAX_RETRIES = 5;
const INITIAL_DELAY = 2000; // 2 seconds
const MAX_DELAY = 30000; // 30 seconds

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDelay(attempt) {
  return Math.min(INITIAL_DELAY * Math.pow(2, attempt), MAX_DELAY);
}

function isFontInliningError(errorOutput) {
  const fontErrorPatterns = [
    'Inlining of fonts failed',
    'fonts.googleapis.com',
    'socket hang up',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET'
  ];
  
  return fontErrorPatterns.some(pattern => 
    errorOutput.toLowerCase().includes(pattern.toLowerCase())
  );
}

async function buildWithRetry() {
  let lastError;
  let lastErrorOutput = '';
  
  console.log('🔧 Starting Angular build with network retry logic...');
  console.log(`📊 Max retries: ${MAX_RETRIES}`);
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`\n🚀 Build attempt ${attempt + 1}/${MAX_RETRIES}`);
      
      if (attempt > 0) {
        const delay = calculateDelay(attempt);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
      
      console.log('📦 Starting Angular production build...');
      
      // Run the build command and capture output
      const output = execSync('ng build --configuration=production', {
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      console.log('✅ Build completed successfully!');
      return;
      
    } catch (error) {
      lastError = error;
      lastErrorOutput = error.stdout || error.stderr || error.message;
      
      console.error(`❌ Build attempt ${attempt + 1} failed`);
      
      // Check if it's a font inlining issue
      if (isFontInliningError(lastErrorOutput)) {
        console.error('🎨 Font inlining error detected - network connectivity issue');
      }
      
      if (attempt < MAX_RETRIES - 1) {
        const nextDelay = calculateDelay(attempt + 1);
        console.log(`🔄 Will retry in ${nextDelay}ms...`);
      }
    }
  }
  
  // If all retries failed, try the no-fonts configuration as last resort
  if (isFontInliningError(lastErrorOutput)) {
    console.log('\n🔄 Trying fallback build configuration (no font inlining)...');
    try {
      console.log('📦 Starting fallback build without font optimization...');
      
      const fallbackOutput = execSync('ng build --configuration=production-no-fonts', {
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      console.log('✅ Fallback build completed successfully!');
      console.log('⚠️  Note: Font inlining was disabled due to network issues');
      return;
      
    } catch (fallbackError) {
      console.error('❌ Fallback build also failed:', fallbackError.message);
    }
  }
  
  console.error(`\n💥 All build attempts failed!`);
  
  if (isFontInliningError(lastErrorOutput)) {
    console.error('\n🎨 FONT INLINING ISSUE DETECTED');
    console.error('💡 Solutions:');
    console.error('   1. Use local font files instead of Google Fonts');
    console.error('   2. Configure network access to fonts.googleapis.com');
    console.error('   3. Disable font inlining in Angular configuration');
  }
  
  process.exit(1);
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Build interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Build terminated');
  process.exit(0);
});

// Start the build process
buildWithRetry().catch(error => {
  console.error('💥 Unexpected error during build:', error);
  process.exit(1);
});
