'use client';
// import styles from './page.module.css';

import { useSong } from '@repo/query';

export default function Home() {
  const { data } = useSong({ title: '불나방' });
  console.log(data);

  return (
    <div>
      <main>
        <h1>Hello World</h1>
      </main>
      <footer>
        <h1>fotter</h1>
      </footer>
    </div>
  );
}
