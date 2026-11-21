const path = require('node:path');
const { pathToFileURL } = require('node:url');
const esbuild = require('esbuild');
(async () => {
  const arquivo = path.join(__dirname, 'usuarios.node.generated.mjs');
  await esbuild.build({ entryPoints: [path.join(__dirname, 'usuarios.node.ts')], outfile: arquivo, bundle: true, platform: 'node', packages: 'external', format: 'esm', logLevel: 'silent' });
  await import(pathToFileURL(arquivo).href);
})().catch(e => { console.error(e); process.exitCode = 1; });
