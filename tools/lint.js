#!/usr/bin/env node
/* Lint for the no-build app. Run: npm run lint
   The scripts share one global scope (load order in index.html), so they are joined in that order and linted as ONE file.
   That catches the bugs a per-file check misses: a function defined twice in two files (the later one silently wins),
   duplicate object keys, calls to names that do not exist, unreachable code.
   Lint para la app sin build. Los scripts comparten un solo ámbito global, así que se unen en el orden de index.html y se revisan como UN archivo:
   atrapa funciones definidas dos veces en archivos distintos, claves duplicadas y nombres que no existen. */
const fs = require('fs'), path = require('path');
const { ESLint } = require('eslint');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => !/^lib\//.test(f)); // vendor libs are not ours / librerías de terceros no
let code = '', map = [], line = 1;
srcs.forEach(f => {
  let c = fs.readFileSync(path.join(ROOT, f), 'utf8'); if (!c.endsWith('\n')) c += '\n';
  map.push([line, f]); code += c; line += c.split('\n').length - 1;
});
const where = n => { let m = map[0]; for (const e of map) if (e[0] <= n) m = e; return m[1] + ':' + (n - m[0] + 1); };
const rules = {};
['no-undef','no-dupe-keys','no-dupe-args','no-unreachable','no-func-assign','no-const-assign','no-self-assign','no-self-compare','no-dupe-else-if','no-duplicate-case','no-unsafe-negation','use-isnan','valid-typeof','no-empty-character-class','no-sparse-arrays','no-unused-labels','no-compare-neg-zero','no-loss-of-precision','no-redeclare','getter-return'].forEach(r => { rules[r] = 'error'; });
rules['no-cond-assign'] = ['error', 'except-parens'];
(async () => {
  const eslint = new ESLint({
    useEslintrc: false,
    overrideConfig: {
      env: { browser: true, es2021: true },
      parserOptions: { ecmaVersion: 2021, sourceType: 'script' },
      globals: { qrcode: 'readonly', jsQR: 'readonly' }, // from lib/*.min.js
      rules
    }
  });
  const [res] = await eslint.lintText(code, { filePath: 'all.js' });
  res.messages.forEach(m => console.log(where(m.line) + '  ' + m.ruleId + '  ' + m.message));
  if (res.errorCount) { console.log('\nLINT FAILED / FALLÓ: ' + res.errorCount + ' problem(s) in ' + srcs.length + ' files'); process.exit(1); }
  console.log('Lint OK / BIEN — ' + srcs.length + ' files, ' + line + ' lines');
})();
