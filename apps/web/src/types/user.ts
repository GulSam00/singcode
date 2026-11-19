export interface User {
  id: string;
  nickname: string;
  profile_image: string | null;
  point: number;
  last_check_in: Date | null;
}

/** PATCH /api/user/check-in 응답. 이미 오늘(KST) 출석했으면 awarded=false다. */
export interface CheckInResult {
  awarded: boolean;
  last_check_in: string;
  point: number;
}
