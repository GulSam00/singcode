'use client'

import { useSong } from '@repo/query'
import ErrorWrapper from '@/errorWrapper'

export default function Home() {
  const { data } = useSong({ title: '불나방' })
  console.log('data : ', data)

  return (
    <ErrorWrapper>
      <div>
        <main className="bg-primary">
          <h1>Hello World</h1>
        </main>
        <h1 className="flex items-center justify-center bg-red-500 text-xl">Hello world!</h1>

        <footer>
          <h1>fotter</h1>
        </footer>
      </div>
    </ErrorWrapper>
  )
}
