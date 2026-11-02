// Compila el juego: concatena los módulos en el orden de src/manifest.json,
// envuelve los datos en su propio ámbito, minifica con esbuild y genera dist/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import * as esbuild from 'esbuild';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const dev = process.argv.includes('--dev');

const read = (p) => fs.readFileSync(p, 'utf8');
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

// Configuración pública de Supabase (la clave anon es pública; la seguridad está en las políticas RLS).
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pqvkdaimixgdzkhiygkj.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdmtkYWltaXhnZHpraGl5Z2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NTAzNDEsImV4cCI6MjEwOTIyNjM0MX0.oPHb5YJPja28hXrQcwzGf7dAOSbiFPtcrq-BHS8rDu0';

function vendorBundle() {
  const three = path.dirname(require.resolve('three/package.json'));
  const files = [
    path.join(three, 'build/three.min.js'),
    path.join(three, 'examples/js/loaders/GLTFLoader.js'),
    path.join(three, 'examples/js/utils/SkeletonUtils.js'),
    path.join(three, 'examples/js/utils/BufferGeometryUtils.js'),
    require.resolve('@supabase/supabase-js/dist/umd/supabase.js'),
  ];
  return files.map(read).join(';\n');
}

// Cada carpeta de src/ era un script clásico independiente y se mantiene así (un archivo por unidad):
// los scripts clásicos comparten el ámbito global, y separarlos conserva el orden de carga original.
function gameUnits() {
  const manifest = JSON.parse(read(path.join(SRC, 'manifest.json')));
  const part = (f) => `// ---- ${f}\n${read(path.join(SRC, f))}`;
  const units = [];
  const config = `window.SB_CONFIG={url:${JSON.stringify(SUPABASE_URL)},anonKey:${JSON.stringify(SUPABASE_ANON_KEY)}};`;
  units.push({ name: 'platform', code: `'use strict';\n${config}\n${part('platform/supabase.js')}` });
  for (const m of manifest) {
    const name = path.dirname(m.file).replace(/\//g, '-');
    let u = units[units.length - 1];
    if (u.name !== name) units.push((u = { name, code: '', files: [] }));
    u.files.push(m.file);
  }
  for (const u of units) {
    if (!u.files) continue;
    const body = u.files.map(part).join('\n');
    u.code = u.name === 'data' ? `(()=>{\n'use strict';\n${body}\n})();` : `'use strict';\n${body}`;
  }
  units.push({ name: 'web-patch', code: `'use strict';\n${part('platform/web-patch.js')}` });
  return units;
}

function cssBundle() {
  const order = JSON.parse(read(path.join(SRC, 'styles/order.json')));
  return order.map((f) => read(path.join(SRC, f))).join('\n');
}

async function minify(code, loader) {
  if (dev) return code;
  const r = await esbuild.transform(code, { loader, minify: true, target: 'es2020', legalComments: 'none' });
  return r.code;
}

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

  const vendor = vendorBundle(); // ya viene minificado
  const vfile = `js/vendor.${hash(vendor)}.js`;
  fs.writeFileSync(path.join(DIST, vfile), vendor);
  const scripts = [vfile];
  for (const u of gameUnits()) {
    const code = await minify(u.code, 'js');
    const f = `js/${u.name}.${hash(code)}.js`;
    fs.writeFileSync(path.join(DIST, f), code);
    scripts.push(f);
  }
  const css = await minify(cssBundle(), 'css');
  const cssFile = `css/style.${hash(css)}.css`;
  fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
  fs.writeFileSync(path.join(DIST, cssFile), css);
  const out = { css: cssFile };
  const html = read(path.join(SRC, 'index.html'))
    .replace('<!--STYLES-->', `<link rel="stylesheet" href="${out.css}">`)
    .replace('<!--SCRIPTS-->', scripts.map((f) => `<script src="${f}"></script>`).join('\n'));
  fs.writeFileSync(path.join(DIST, 'index.html'), html);
  const total = scripts.reduce((n, f) => n + fs.statSync(path.join(DIST, f)).size, 0);
  console.log(
    `dist/ listo${dev ? ' (dev)' : ''}: ${scripts.length} scripts, ${Math.round(total / 1024)} KB de JS, ${Math.round(css.length / 1024)} KB de CSS`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
