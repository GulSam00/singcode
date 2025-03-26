import { createClient } from '@/supabase/server';

import Button from './button';

export default async function Instruments() {
  const supabase = await createClient();
  console.log('supabase : ', supabase);
  const data = await supabase.from('test').select();

  const newData = await supabase.from('test').select('*');

  console.log('data : ', data);
  console.log('newData : ', newData);

  return (
    <pre>
      {JSON.stringify(newData, null, 2)}
      <Button />
    </pre>
  );
}
