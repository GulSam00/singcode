'use client';
import styles from './page.module.css';

import { getComposer } from '@repo/api';
import { useEffect } from 'react';

export default function Home() {
  const testAPI = async () => {
    const response = await getComposer({ composer: '아이유' });
    console.log(response);
  };
  useEffect(() => {
    testAPI();
  }, []);
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Hello World</h1>
      </main>
      <footer className={styles.footer}>
        <h1>fotter</h1>
      </footer>
    </div>
  );
}
