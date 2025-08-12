import test from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import TripList from '../TripList.tsx';

test('TripList renders trips and remaining stops', () => {
  const trips = [
    { id: 1, stops: [ { id: 1, store_id: 1, sequence: 1, visited: false }, { id: 2, store_id: 2, sequence: 2, visited: true } ] },
    { id: 2, stops: [] }
  ];
  const html = renderToStaticMarkup(<TripList trips={trips} onSelect={() => {}} />);
  assert.ok(html.includes('Trip #1'));
  assert.ok(html.includes('1 stops remaining'));
  assert.ok(html.includes('Trip #2'));
});
