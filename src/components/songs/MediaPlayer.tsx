'use client';

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function MediaPlayer({ audioUrl, videoUrl }: { audioUrl: string | null; videoUrl: string | null }) {
  if (!audioUrl && !videoUrl) return null;

  const youtubeEmbed = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="mb-6 space-y-3">
      {videoUrl && (
        <div className="overflow-hidden rounded-2xl border border-navy-100 shadow-card">
          {youtubeEmbed ? (
            <div className="aspect-video w-full">
              <iframe
                src={youtubeEmbed}
                title="Video del himno"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-navy-50 p-4 text-center text-sm font-medium text-navy-700 hover:bg-navy-100"
            >
              Ver video del himno ↗
            </a>
          )}
        </div>
      )}
      {audioUrl && (
        <audio controls className="w-full rounded-xl" preload="none">
          <source src={audioUrl} />
          Tu navegador no soporta el elemento de audio.
        </audio>
      )}
    </div>
  );
}
