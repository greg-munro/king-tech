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

export async function getData(): Promise<Item[]> {
  const res = await fetch(GCS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch GCS data: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { output: Item[] };
  return json.output;
}
