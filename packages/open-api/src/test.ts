import { getSong, getSinger, getComposer, getLyricist, getRelease } from './index.js';

console.log('get song test');

// 요청 시 공백 제거해서 보내져야 함

// const response = await getSong({ title: 'theworldsmallest' });
// console.log('response', response);

// const response2 = await getSong({ title: '반딧불' });
// console.log('response2', response2);

// console.log('get singer test');

// const response3 = await getSinger({ singer: '아이유', brand: 'kumyoung' });
// console.log('response3', response3);

// const response4 = await getSinger({ singer: 'PLAVE' });
// console.log('response4', response4);

// console.log('get composer test');

// const response5 = await getComposer({ composer: '아이유', brand: 'kumyoung' });
// console.log('response5', response5);

// const response6 = await getComposer({ composer: '아이유' });
// console.log('response6', response6);

// console.log('get lyricist test');

// const response7 = await getLyricist({ lyricist: '아이유', brand: 'kumyoung' });
// console.log('response7', response7);

// const response8 = await getLyricist({ lyricist: '아이유' });
// console.log('response8', response8);

// console.log('get release test');

let year = 2010;
let month = 1;

const parseMonth = (month: number) => {
  return month < 10 ? `0${month}` : month;
};

// TJ는 업데이트 충실한데 금영은 안되있음
// 그냥 TJ 것만 파싱해서 넣을까?
// 기존 DB와 중복되지 않게 tj_num, ky_num 고유값으로
while (year <= 2025) {
  month = 1;
  while (month <= 12) {
    const response9 = await getRelease({ release: `${year}${parseMonth(month)}`, brand: 'tj' });
    // console.log('response9', response9);
    // console.log('response9', `${year}${parseMonth(month)}`, response9?.length);
    response9?.forEach((item: any) => {
      const { title, singer, composer, lyricist } = item;
      if (singer === 'ヨルシカ') {
        console.log('item', item);
      }
    });

    month++;
  }
  year++;
}
