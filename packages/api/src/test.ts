import { getSong, getSinger, getComposer, getLyricist } from './index';

console.log('get song test');

const response = await getSong({ title: '아이유', brand: 'kumyoung' });
console.log('response', response);

const response2 = await getSong({ title: '아이유' });
console.log('response2', response2);

console.log('get singer test');

const response3 = await getSinger({ singer: '아이유', brand: 'kumyoung' });
console.log('response3', response3);

const response4 = await getSinger({ singer: '아이유' });
console.log('response4', response4);

console.log('get composer test');

const response5 = await getComposer({ composer: '아이유', brand: 'kumyoung' });
console.log('response5', response5);

const response6 = await getComposer({ composer: '아이유' });
console.log('response6', response6);

console.log('get lyricist test');

const response7 = await getLyricist({ lyricist: '아이유', brand: 'kumyoung' });
console.log('response7', response7);

const response8 = await getLyricist({ lyricist: '아이유' });
console.log('response8', response8);
