// scripts/seedStores.ts
// Seeds stores from OpenStreetMap (Overpass API). No API key required.
import { Client } from 'pg';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const db = new Client({ connectionString: process.env.DATABASE_URL });

// [lat, lng] centres to search around; add more locations as needed.
const centres: [number, number][] = [[51.5074, -0.1278]];

async function seed() {
  await db.connect();

  for (const [lat, lng] of centres) {
    const query = `[out:json][timeout:25];node(around:5000,${lat},${lng})["shop"~"supermarket|convenience|grocery"]["name"];out 50;`;
    const res = await axios.post(
      'https://overpass-api.de/api/interpreter',
      'data=' + encodeURIComponent(query),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    for (const el of res.data.elements) {
      const name: string = el.tags.name;
      const address = [el.tags['addr:housenumber'], el.tags['addr:street'], el.tags['addr:city']]
        .filter(Boolean)
        .join(' ') || name;
      await db.query(
        `INSERT INTO stores (name, address, latitude, longitude)
         VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
        [name, address, el.lat, el.lon]
      );
    }
  }

  console.log('Store seed complete');
  await db.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
