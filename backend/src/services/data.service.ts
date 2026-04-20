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

const TTL_MS = 3 * 60 * 1000; // 3 minutes

let cache: Item[] | null = null;
let cacheTime: number | null = null;

async function fetchFromGCS(): Promise<Item[]> {
  console.log('Fetching data from GCS...');
  const res = await fetch(GCS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch GCS data: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { output: Item[] };
  console.log(`Cached ${json.output.length} items.`);
  return json.output;
}

export async function loadData(): Promise<void> {
  cache = await fetchFromGCS();
  cacheTime = Date.now();
}

export async function getData(): Promise<Item[]> {
  const isStale = cacheTime === null || Date.now() - cacheTime > TTL_MS;

  if (isStale) {
    cache = await fetchFromGCS();
    cacheTime = Date.now();
  }

  return cache!;
}
