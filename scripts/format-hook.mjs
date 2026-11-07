// Hook de Claude Code: después de editar un archivo, lo formatea con Prettier (si es del proyecto).
import { execFileSync } from 'node:child_process';
import path from 'node:path';

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    const { tool_input: t = {} } = JSON.parse(input || '{}');
    const file = t.file_path || t.path;
    if (!file) return;
    const rel = path.relative(process.cwd(), file);
    if (rel.startsWith('..') || !/^(src|scripts|tests)\//.test(rel) || !/\.(js|mjs|css|html)$/.test(rel)) return;
    execFileSync('npx', ['prettier', '--write', '--log-level', 'warn', rel], { stdio: 'inherit' });
  } catch {
    /* un fallo al formatear no debe bloquear la edición */
  }
});
