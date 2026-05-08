'use client';

import Script from 'next/script';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import {
  useAddKaraokeFavoriteMutation,
  useDeleteKaraokeFavoriteMutation,
  useKaraokeFavoritesQuery,
} from '@/queries/karaokeQuery';
import useAuthStore from '@/stores/useAuthStore';

export default function KakaoMap() {
  const { mapRef, selectedPlace, setIsScriptLoaded } = useKakaoMap();

  const { isAuthenticated } = useAuthStore();
  const { data: favorites = [] } = useKaraokeFavoritesQuery(isAuthenticated);
  const addFavorite = useAddKaraokeFavoriteMutation();
  const deleteFavorite = useDeleteKaraokeFavoriteMutation();

  const favoriteIds = new Set(favorites.map(f => f.place_id));

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (!selectedPlace) return;

    const isFav = favoriteIds.has(selectedPlace.id);
    if (isFav) {
      deleteFavorite.mutate(selectedPlace.id, {
        onSuccess: () => toast.success(`${selectedPlace.place_name} 즐겨찾기 삭제`),
      });
    } else {
      addFavorite.mutate(
        {
          placeId: selectedPlace.id,
          placeName: selectedPlace.place_name,
          address: selectedPlace.road_address_name || selectedPlace.address_name,
          lat: Number(selectedPlace.y),
          lng: Number(selectedPlace.x),
        },
        { onSuccess: () => toast.success(`${selectedPlace.place_name} 즐겨찾기 추가`) },
      );
    }
  };

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div className="flex h-full flex-col gap-3">
        <div ref={mapRef} className="w-full flex-1 rounded-lg" style={{ minHeight: '60vh' }} />

        {selectedPlace && (
          <div className="bg-card rounded-lg border p-4">
            <p className="font-semibold">{selectedPlace.place_name}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {selectedPlace.road_address_name || selectedPlace.address_name}
            </p>
            {selectedPlace.phone && (
              <p className="text-muted-foreground text-sm">{selectedPlace.phone}</p>
            )}
            <Button
              className="mt-3 w-full"
              variant={favoriteIds.has(selectedPlace.id) ? 'destructive' : 'default'}
              onClick={handleFavoriteToggle}
              disabled={addFavorite.isPending || deleteFavorite.isPending}
            >
              {favoriteIds.has(selectedPlace.id) ? '즐겨찾기 삭제' : '즐겨찾기 추가'}
            </Button>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="bg-card rounded-lg border p-4">
            <p className="mb-2 font-semibold">즐겨찾기 ({favorites.length})</p>
            <ul className="flex flex-col gap-2">
              {favorites.map(fav => (
                <li key={fav.place_id} className="flex items-center justify-between text-sm">
                  <span>{fav.place_name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground h-auto px-2 py-1 text-xs"
                    onClick={() =>
                      deleteFavorite.mutate(fav.place_id, {
                        onSuccess: () => toast.success(`${fav.place_name} 삭제`),
                      })
                    }
                  >
                    삭제
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
