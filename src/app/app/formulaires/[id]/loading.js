// Skeleton builder — sidebar masquée car builder est fullscreen.
import { Loader2 } from 'lucide-react';

export default function FormBuilderLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={24} className="mx-auto text-pink-600 animate-spin mb-3" />
        <p className="text-sm text-content-tertiary">Chargement du builder…</p>
      </div>
    </div>
  );
}
