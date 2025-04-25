import {
  getComposer,
  getLyricist,
  getNo,
  getPopular,
  getRelease,
  getSinger,
  getSong,
} from "@repo/open-api";

let year = 2025;
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
    const response9 = await getRelease({
      release: `${year}${parseMonth(month)}`,
      brand: "tj",
    });
    // console.log('response9', response9);
    // console.log('response9', `${year}${parseMonth(month)}`, response9?.length);
    response9?.forEach((item) => {
      const { title, singer, composer, lyricist } = item;
      console.log("item", item);
    });

    month++;
  }
  year++;
}
