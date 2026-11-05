import { spawnSync } from 'node:child_process';
// Direct Node entry points also work in Windows folders containing an ampersand.
for (const args of [
  ['node_modules/typescript/bin/tsc', '-b'],
  ['node_modules/vite/bin/vite.js', 'build'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
