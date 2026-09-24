import { Badge } from '@/components/ui/badge';

export function ProductStatusBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <Badge variant={isAvailable ? 'success' : 'destructive'}>
      {isAvailable ? 'Dostępny' : 'Niedostępny'}
    </Badge>
  );
}
