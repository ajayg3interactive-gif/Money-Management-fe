const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const outPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');

const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        env[match[1]] = (match[2] || '').trim().replace(/^["']|["']$/g, '');
      }
    });
}

const apiOrigin = env.API_URL || 'http://localhost:3000';

const content = `// This file is auto-generated from .env by scripts/generate-env.js. Do not edit directly.
export const environment = {
  apiOrigin: '${apiOrigin}',
};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content);
console.log(`Generated ${path.relative(process.cwd(), outPath)} from .env`);
