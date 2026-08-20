export type ArtistCountryCode = 'KR' | 'JP' | 'US';

export interface ArtistSearchResult {
  name: string;
  name_ko: string | null;
  country_code: ArtistCountryCode | null;
}
