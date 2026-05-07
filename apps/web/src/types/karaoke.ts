export interface KaraokeFavorite {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  phone: string;
  place_url: string;
}
