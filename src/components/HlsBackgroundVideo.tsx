import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsBackgroundVideoProps {
  src: string;
  flipped?: boolean;
  overlayClassName?: string;
  showBottomFade?: boolean;
}

export const HlsBackgroundVideo: React.FC<HlsBackgroundVideoProps> = ({
  src,
  flipped = false,
  overlayClassName = "bg-black/20",
  showBottomFade = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const isHls = typeof src === 'string' && src.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay was prevented or postponed
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              break;
          }
        }
      });
    } else {
      // Direct video playback (MP4, WebM, MOV, blob URL, or Safari native HLS)
      video.src = src;
      video.load();
      video.play().catch(() => {});
    }

    // Explicit loop restart handler to guarantee continuous playback without freezing
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ${
          flipped ? 'scale-y-[-1]' : ''
        }`}
      />

      {/* Dark overlay */}
      <div className={`absolute inset-0 ${overlayClassName}`} />

      {/* Optional bottom fade gradient */}
      {showBottomFade && (
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
      )}
    </div>
  );
};
