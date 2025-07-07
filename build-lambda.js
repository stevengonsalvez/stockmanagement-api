const esbuild = require('esbuild');
const path = require('path');

async function build() {
  try {
    // Build get-stock-availability handler
    await esbuild.build({
      entryPoints: ['src/handlers/get-stock-availability.js'],
      bundle: true,
      outfile: 'build/get-stock-availability.js',
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      external: [],
      sourcemap: true,
    });

    // Build move-stock handler
    await esbuild.build({
      entryPoints: ['src/handlers/move-stock.js'],
      bundle: true,
      outfile: 'build/move-stock.js',
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      external: [],
      sourcemap: true,
    });

    // Build debug handler
    await esbuild.build({
      entryPoints: ['src/handlers/debug-handler.js'],
      bundle: true,
      outfile: 'build/debug-handler.js',
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      external: [],
      sourcemap: true,
    });

    // Build minimal test handler (no bundling)
    await esbuild.build({
      entryPoints: ['src/handlers/minimal-test.js'],
      bundle: false,
      outfile: 'build/minimal-test.js',
      platform: 'node',
      target: 'node18',
      format: 'cjs',
    });

    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();