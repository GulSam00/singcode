import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  // API KEY 노출을 막기 위해 미들웨어 역할을 할 API ROUTE 활용

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: songs, error } = await supabase
    .from('songs')
    .select('*')
    .textSearch('title', query);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(songs);
}
