'use client'

import { useSong } from '@repo/query'

export default function Home() {
  const { data } = useSong({ title: '불나방' })
  console.log('data : ', data)

  return (
    <div>
      <main>
        <h1>Hello World</h1>
      </main>
      <h1 className="bg-red-500 text-xl">Hello world!</h1>

      <footer>
        <h1>fotter</h1>
      </footer>
    </div>
  )
}
