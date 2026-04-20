export interface Item {
  id: string | number;
  name: string;
  status: string;
  description: string;
  delta: number;
  createdOn: number;
}

const GCS_URL =
  'https://storage.googleapis.com/king-airnd-recruitment-sandbox-data/data.json';

let cache: Item[] | null = null;

export async function loadData(): Promise<void> {
  console.log('Fetching data from GCS...');
  const res = await fetch(GCS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch GCS data: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { output: Item[] };
  cache = json.output;
  console.log(`Cached ${cache.length} items.`);
}

export function getData(): Item[] {
  if (!cache) {
    throw new Error('Data not loaded yet. Call loadData() on startup.');
  }
  return cache;
}
