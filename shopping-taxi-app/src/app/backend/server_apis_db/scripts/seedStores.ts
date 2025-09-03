// scripts/seedStores.ts
import { Client } from 'pg';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const db = new Client({ connectionString: process.env.DATABASE_URL });

async function seed() {
  await db.connect();
  const queries = [
    'grocery store near London, UK',
    'supermarket near London, UK',
    // add more queries or locations as needed
  ];

  for (const q of queries) {
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`, {
        params: { query: q, key: GOOGLE_API_KEY, type: 'grocery_or_supermarket', radius: 5000 }
      }
    );
    for (const place of res.data.results) {
      const { name, formatted_address, geometry } = place;
      const lat = geometry.location.lat;
      const lng = geometry.location.lng;
      await db.query(
        `INSERT INTO stores (name, address, latitude, longitude)
         VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
        [name, formatted_address, lat, lng]
      );
    }
  }

  console.log('Store seed complete');
  await db.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
