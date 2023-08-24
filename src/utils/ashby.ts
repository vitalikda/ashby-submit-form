const ASHBY_API_URL = process.env.ASHBY_API_URL
const ASHBY_API_KEY = process.env.ASHBY_API_KEY

export type ICareer = {
  id: string
  title: string
}

export type ICareerInfo = {
  id: string
  title: string
  descriptionHtml: string
}

const fetcher: typeof fetch = async (path, options) => {
  if (!ASHBY_API_URL || !ASHBY_API_KEY) {
    throw new Error('Missing ASHBY environment variables')
  }

  const apiKey = Buffer.from(ASHBY_API_KEY + ':').toString('base64')

  return fetch(ASHBY_API_URL + path, {
    ...options,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Basic ${apiKey}`,
      ...options?.headers
    }
  })
}

export const getCareersApi = async (): Promise<ICareer[] | undefined> => {
  try {
    const res = await fetcher(`/jobPosting.list`, {
      body: JSON.stringify({
        listedOnly: true
      })
    })
    return (await res.json())?.results
  } catch (err) {
    return
  }
}

export const getCareerInfoApi = async (
  id: string
): Promise<ICareerInfo | undefined> => {
  try {
    const res = await fetcher(`/jobPosting.info`, {
      body: JSON.stringify({
        jobPostingId: id
      })
    })
    return (await res.json())?.results
  } catch {
    return
  }
}

export const submitApplicationApi = async (
  data: FormData
): Promise<any | undefined> => {
  try {
    const res = await fetcher(`/applicationForm.submit`, {
      headers: {
        'content-type': 'multipart/form-data',
      },
      body: data
    })
    console.log(await res.text())
    return (await res.json())?.results
  } catch (err) {
    return
  }
}
