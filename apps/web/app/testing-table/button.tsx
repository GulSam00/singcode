'use client';

import { createClient } from '@/lib/supabase/client';

const Button = () => {
  const supabase = createClient();

  const handleInsertData = async () => {
    const { data, error } = await supabase.from('test').insert({ name: 'testing' });
    console.log('data : ', data);
    console.log('error : ', error);
  };

  return (
    <button type="button" onClick={handleInsertData}>
      insert Data
    </button>
  );
};

export default Button;
