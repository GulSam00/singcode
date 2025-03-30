import SongList from './SongList';

// import TestDND from './TestDND';
// import TestDNDHandle from './TestDNDHandle';

export default function Home() {
  return (
    <div className="container mx-auto px-2 py-8">
      <h1 className="mb-6 text-2xl font-bold">노래방 플레이리스트</h1>
      <SongList />

      {/* <TestDND />
      <TestDNDHandle /> */}
    </div>
  );
}
