export interface User {
  id: string;
  nickname: string;
  profile_image: string | null;
  point: number;
  last_check_in: Date | null;
}
