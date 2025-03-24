'use client'

import { getComposer } from '@repo/api'
import { useState } from 'react'

export default function Home() {
  const [search, setSearch] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <input type="text" placeholder="검색어를 입력해주세요" onChange={handleSearch} />
      <footer>
        <h1>fotter</h1>
      </footer>
    </div>
  )
}
