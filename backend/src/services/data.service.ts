export interface Item {
  id: string | number
  name: string
  status: string
  description: string
  delta: number
  createdOn: number
}

const GCS_URL =
  'https://storage.googleapis.com/king-airnd-recruitment-sandbox-data/data.json'

const TTL_MS = 3 * 60 * 1000 // 3 minutes

let cache: Item[] | null = null
let cacheTime: number | null = null

export async function getData(): Promise<Item[]> {
  const isStale = cacheTime === null || Date.now() - cacheTime > TTL_MS

  if (isStale) {
    console.log('Fetching data from GCS...')

    const res = await fetch(GCS_URL)

    if (!res.ok) {
      throw new Error(
        `Failed to fetch GCS data: ${res.status} ${res.statusText}`,
      )
    }

    const json = (await res.json()) as { output: Item[] }

    cache = json.output
    cacheTime = Date.now()

    console.log(`Cached ${cache.length} items.`)
  }

  return cache!
}
