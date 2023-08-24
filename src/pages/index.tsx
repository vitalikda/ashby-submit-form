import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Inter } from 'next/font/google'
import { ICareerInfo, getCareerInfoApi, getCareersApi } from '@/utils/ashby'

const inter = Inter({ subsets: ['latin'] })

export async function getStaticProps() {
  const careers = await getCareersApi()
  const careerId = careers?.[0]?.id
  const career = careerId ? await getCareerInfoApi(careerId) : null

  if (!career) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      career
    },
    revalidate: 30
  }
}

export default function Home({ career }: { career: ICareerInfo }) {
  const { id, title, descriptionHtml } = career

  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      resumeFile: null as FileList | null
    }
  })

  const onSubmit = handleSubmit(async ({ name, email, resumeFile }) => {
    if (!id || !name || !email || !resumeFile) return

    try {
      setIsLoading(true)

      const formData = new FormData()
      const fileName = 'resumeFile'
      const fieldSubmissions = [
        { path: '_systemfield_name', value: name },
        { path: '_systemfield_email', value: email },
        { path: '_systemfield_resume', value: fileName }
      ]
      formData.append('jobPostingId', id)
      formData.append('applicationForm', JSON.stringify({ fieldSubmissions }))
      formData.append(fileName, resumeFile[0])

      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData
      })
      // console.log(res)
    } catch {
      // console.log('error')
      // TODO: add error handling
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center">{title}</h1>
        <div
          className="mt-8 prose prose-lg"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>

      <div className="flex flex-col items-center justify-center mt-12">
        <h2 className="text-2xl font-bold text-center">Application Form</h2>
        <form
          className="flex flex-col items-center justify-center mt-8"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col items-start justify-center w-full">
            <label className="text-lg font-bold" htmlFor="name">
              Name
            </label>
            <input
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="text"
              id="name"
              {...register('name', { required: true })}
            />
          </div>

          <div className="flex flex-col items-start justify-center w-full mt-4">
            <label className="text-lg font-bold" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="email"
              id="email"
              {...register('email', { required: true })}
            />
          </div>

          <div className="flex flex-col items-start justify-center w-full mt-4">
            <label className="text-lg font-bold" htmlFor="resumeFile">
              Resume
            </label>
            <input
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="file"
              id="resumeFile"
              {...register('resumeFile', { required: true })}
            />
          </div>

          <button
            className="px-4 py-2 mt-8 text-lg font-bold text-white bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>
    </main>
  )
}
