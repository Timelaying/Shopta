import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'shopping-taxi-app/src/app/Frontend/Customer/TripPlanner/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');

test('TripPlanner page contains expected headings', () => {
  assert.ok(content.includes('Select Stops'));
  assert.ok(content.includes('Vehicle Size'));
});
