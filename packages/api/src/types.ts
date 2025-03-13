// kumyoung / tj / dam / joysound
export type Brand = 'kumyoung' | 'tj' | 'dam' | 'joysound';
export type Period = 'daily' | 'weekly' | 'monthly';

export interface ResponseType {
  brand: Brand;
  no: string;
  title: string;
  singer: string;
  composer: string;
  lyricist: string;
  release: string;
}

export interface InstanceResponse {
  data: ResponseType | null;
  success: boolean;
  error?: string;
}
