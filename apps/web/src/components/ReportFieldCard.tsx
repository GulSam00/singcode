import { ReportCardField } from '@/types/report';
import { cn } from '@/utils/cn';

interface ReportFieldCardProps {
  title: string;
  artist: string;
  title_ko?: string;
  artist_ko?: string;
  num_tj?: string;
  num_ky?: string;
  activeField: ReportCardField | null;
  newValue: string | null;
}

function splitDisplay(
  translated: string | undefined,
  original: string,
): { primary: string; secondary: string | null } {
  if (translated && translated !== original) {
    return { primary: translated, secondary: original };
  }
  return { primary: original || '-', secondary: null };
}

function NewValueIndicator({
  isVisible,
  value,
  textSize,
}: {
  isVisible: boolean;
  value: string | null;
  textSize: 'text-base' | 'text-sm';
}) {
  return (
    <>
      <span className={cn('text-muted-foreground shrink-0', !isVisible && 'invisible')}>→</span>
      <span
        className={cn(
          'text-primary min-w-0 truncate font-medium',
          textSize,
          !isVisible && 'invisible',
        )}
      >
        {value ?? ' '}
      </span>
    </>
  );
}

export default function ReportFieldCard({
  title,
  artist,
  title_ko,
  artist_ko,
  num_tj,
  num_ky,
  activeField,
  newValue,
}: ReportFieldCardProps) {
  const titleParts = splitDisplay(title_ko, title);
  const artistParts = splitDisplay(artist_ko, artist);

  const isFieldActive = (field: ReportCardField) => activeField === field && newValue !== null;

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            'rounded-sm px-2 py-1 transition-colors',
            isFieldActive('title') && 'bg-primary/10',
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 truncate text-base font-medium">{titleParts.primary}</span>
              <NewValueIndicator
                isVisible={isFieldActive('title')}
                value={newValue}
                textSize="text-base"
              />
            </div>
            {titleParts.secondary && (
              <span className="text-muted-foreground truncate text-xs">{titleParts.secondary}</span>
            )}
          </div>
        </div>

        <div
          className={cn(
            'rounded-sm px-2 py-1 transition-colors',
            isFieldActive('artist') && 'bg-primary/10',
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-muted-foreground min-w-0 truncate text-sm">
                {artistParts.primary}
              </span>
              <NewValueIndicator
                isVisible={isFieldActive('artist')}
                value={newValue}
                textSize="text-sm"
              />
            </div>
            {artistParts.secondary && (
              <span className="text-muted-foreground/70 truncate text-xs">
                {artistParts.secondary}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t pt-2">
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 transition-colors',
            isFieldActive('num_tj') && 'bg-primary/10',
          )}
        >
          <span className="text-brand-tj shrink-0 text-xs font-bold">TJ</span>
          <span className="min-w-0 truncate text-sm font-medium">{num_tj || '-'}</span>
          <NewValueIndicator
            isVisible={isFieldActive('num_tj')}
            value={newValue}
            textSize="text-sm"
          />
        </div>
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 transition-colors',
            isFieldActive('num_ky') && 'bg-primary/10',
          )}
        >
          <span className="text-brand-ky shrink-0 text-xs font-bold">금영</span>
          <span className="min-w-0 truncate text-sm font-medium">{num_ky || '-'}</span>
          <NewValueIndicator
            isVisible={isFieldActive('num_ky')}
            value={newValue}
            textSize="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
