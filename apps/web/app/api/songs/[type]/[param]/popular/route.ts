import { NextRequest, NextResponse } from 'next/server';
import { getPopular, Brand, Period } from '@repo/api';

export async function GET(request: NextRequest) {
  try {
    // URL에서 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand') as Brand;
    const period = searchParams.get('period') as Period;

    // 필수 파라미터 검증
    if (!brand) {
      return NextResponse.json({ error: '브랜드(brand)는 필수 파라미터입니다.' }, { status: 400 });
    }

    if (!period) {
      return NextResponse.json({ error: '기간(period)은 필수 파라미터입니다.' }, { status: 400 });
    }

    // API 호출
    const result = await getPopular({ brand, period });

    // 결과 반환
    if (!result) {
      return NextResponse.json({ error: '인기 노래를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('인기 노래 검색 중 오류 발생:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
