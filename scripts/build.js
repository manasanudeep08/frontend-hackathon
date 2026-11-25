#!/usr/bin/env node
/**
 * Production Client Build Script
 * Enforces NODE_ENV=production before Vite transforms modules, ensuring
 * that React production runtimes are bundled and dev transforms are stripped.
 */
process.env.NODE_ENV = 'production';
import { build } from 'vite';

await build({
  configFile: './vite.config.js',
  mode: 'production'
});
