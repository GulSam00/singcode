'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from 'react';

import { KakaoPlace } from '@/types/karaoke';

declare global {
  interface Window {
    kakao: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export function useKakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const searchNearbyKaraoke = useCallback((map: any, lat: number, lng: number) => {
    const ps = new window.kakao.maps.services.Places();
    const center = new window.kakao.maps.LatLng(lat, lng);
    const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });

    ps.keywordSearch(
      '노래방',
      (data: KakaoPlace[], status: string) => {
        if (status !== window.kakao.maps.services.Status.OK) return;

        data.forEach(place => {
          const position = new window.kakao.maps.LatLng(Number(place.y), Number(place.x));
          const marker = new window.kakao.maps.Marker({ map, position });

          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.close();
            setSelectedPlace(place);
            infowindow.setContent(
              `<div style="padding:6px 10px;font-size:13px;font-weight:bold;">${place.place_name}</div>`,
            );
            infowindow.open(map, marker);
          });
        });
      },
      {
        location: center,
        radius: 1000,
        sort: window.kakao.maps.services.SortBy.DISTANCE,
      },
    );
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.kakao) return;

    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 4,
      };
      const map = new window.kakao.maps.Map(mapRef.current, options);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setCenter(new window.kakao.maps.LatLng(lat, lng));
            searchNearbyKaraoke(map, lat, lng);
          },
          () => {
            searchNearbyKaraoke(map, 37.5665, 126.978);
          },
        );
      } else {
        searchNearbyKaraoke(map, 37.5665, 126.978);
      }
    });
  }, [searchNearbyKaraoke]);

  useEffect(() => {
    if (isScriptLoaded) {
      initMap();
    }
  }, [isScriptLoaded, initMap]);

  return { mapRef, selectedPlace, isScriptLoaded, setIsScriptLoaded };
}
