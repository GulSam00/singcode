import { ChevronDown, ChevronUp, Edit, Music, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { SaveSongFolder } from '@/types/song';

interface IProps {
  folder: SaveSongFolder;
  selectedSongs: Record<string, boolean>;
  expandedPlaylists: Record<string, boolean>;
  areAllSongsSelected: (folderId: string) => boolean;
  toggleAllSongsInPlaylist: (folderId: string) => void;
  getSelectedSongCount: (folderId: string) => number;
  toggleSongSelection: (songId: string) => void;
  renamePlaylist: (folderId: string) => void;
  deletePlaylist: (folderId: string, folderName: string) => void;
  togglePlaylist: (folderId: string) => void;
}

export default function PlaylistCard({
  folder,
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
              id={`folder-${folder.folder_id}`}
              checked={areAllSongsSelected(folder.folder_id)}
              onCheckedChange={() => toggleAllSongsInPlaylist(folder.folder_id)}
              disabled={folder.songList.length === 0}
            />
            <CardTitle className="flex w-40 items-center gap-2 overflow-hidden text-lg text-ellipsis">
              {folder.folder_name}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => renamePlaylist(folder.folder_id)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deletePlaylist(folder.folder_id, folder.folder_name)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePlaylist(folder.folder_id)}
              className="h-8 w-8 p-0"
            >
              {expandedPlaylists[folder.folder_id] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-normal">
            {folder.songList.length}곡
          </span>
          {getSelectedSongCount(folder.folder_id) > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-normal">
              {getSelectedSongCount(folder.folder_id)}곡 선택됨
            </span>
          )}
        </div>
      </CardHeader>

      {expandedPlaylists[folder.folder_id] && (
        <CardContent className="p-0">
          <Separator className="my-2" />
          <div className="px-4">
            {folder.songList.length > 0 ? (
              <div className="space-y-2">
                {folder.songList.map(song => (
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
