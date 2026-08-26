// 아티스트 이름 정규화 규칙은 웹(이달의 아티스트 배지 매칭)과 공유해야 해서
// @repo/constants로 옮겼다. 여기서는 기존 import 경로를 유지하기 위해 재수출만 한다.
export { extractPrimaryArtist, getPrimaryArtistName, isInvalidArtist } from '@repo/constants';
