import { ChevronDown, ChevronUp, Edit, Music, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { SaveSongFolder } from '@/types/song';

interface IProps {
  playlist: SaveSongFolder;
  selectedSongs: Record<string, boolean>;
  expandedPlaylists: Record<string, boolean>;
  areAllSongsSelected: (playlistId: string) => boolean;
  toggleAllSongsInPlaylist: (playlistId: string) => void;
  getSelectedSongCount: (playlistId: string) => number;
  toggleSongSelection: (songId: string) => void;
  renamePlaylist: (playlistId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  togglePlaylist: (playlistId: string) => void;
}

export default function PlaylistCard({
  playlist,
  selectedSongs,
  expandedPlaylists,
  areAllSongsSelected,
  toggleAllSongsInPlaylist,
  getSelectedSongCount,
  toggleSongSelection,
  renamePlaylist,
  deletePlaylist,
  togglePlaylist,
}: IProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`playlist-${playlist.folder_name}`}
              checked={areAllSongsSelected(playlist.folder_name)}
              onCheckedChange={() => toggleAllSongsInPlaylist(playlist.folder_name)}
              disabled={playlist.songList.length === 0}
            />
            <CardTitle className="flex w-40 items-center gap-2 overflow-hidden text-lg text-ellipsis">
              {playlist.folder_name}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => renamePlaylist(playlist.folder_name)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deletePlaylist(playlist.folder_name)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePlaylist(playlist.folder_name)}
              className="h-8 w-8 p-0"
            >
              {expandedPlaylists[playlist.folder_name] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-normal">
            {playlist.songList.length}곡
          </span>
          {getSelectedSongCount(playlist.folder_name) > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-normal">
              {getSelectedSongCount(playlist.folder_name)}곡 선택됨
            </span>
          )}
        </div>
      </CardHeader>

      {expandedPlaylists[playlist.folder_name] && (
        <CardContent className="p-0">
          <Separator className="my-2" />
          <div className="px-4">
            {playlist.songList.length > 0 ? (
              <div className="space-y-2">
                {playlist.songList.map(song => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 border-b py-2 last:border-0"
                  >
                    <Checkbox
                      id={`song-${song.id}`}
                      checked={!!selectedSongs[song.id]}
                      onCheckedChange={() => toggleSongSelection(song.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Music className="text-muted-foreground h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{song.title}</p>
                          <p className="text-muted-foreground text-xs">{song.artist}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-4 text-center">
                <p>재생목록이 비어 있습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
