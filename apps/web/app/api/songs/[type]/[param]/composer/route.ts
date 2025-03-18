import { NextRequest, NextResponse } from 'next/server';
import { getComposer, Brand } from '@repo/api';

export async function GET(request: NextRequest) {
  try {
    // URL에서 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const composer = searchParams.get('composer');
    const brand = searchParams.get('brand') as Brand | undefined;

    // 필수 파라미터 검증
    if (!composer) {
      return NextResponse.json({ error: '작곡가 이름(composer)은 필수 파라미터입니다.' }, { status: 400 });
    }

    // API 호출
    const result = await getComposer({ composer, brand });

    // 결과 반환
    if (!result) {
      return NextResponse.json({ error: '노래를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('노래 검색 중 오류 발생:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
