import CharacterMessage from '@/components/CharacterMessage';

type SearchStatusType = 'loading' | 'empty';

interface SearchStatusProps {
  status: SearchStatusType;
}

export default function SearchStatus({ status }: SearchStatusProps) {
  return (
    <div className="flex h-full items-center justify-center">
      {status === 'loading' ? (
        <CharacterMessage variant="greeting" message="곡을 열심히 찾고 있어요!" />
      ) : (
        <CharacterMessage
          variant="sad"
          message={
            <>
              열심히 찾았는데 결과가 없어요...
              <br />
              혹시 곡이 추가가 안된건 아닐까요?
            </>
          }
        />
      )}
    </div>
  );
}
