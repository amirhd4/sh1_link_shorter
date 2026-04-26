'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video.min';

type Props = {
  vastUrl: string;
};

export default function VastVideoPlayer({ vastUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(true);
  const [clickThrough, setClickThrough] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    let player: any;

    const init = async () => {
      const res = await fetch(vastUrl);
      const xmlText = await res.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'text/xml');

      const mediaNode = xml.querySelector('MediaFile');
      const mediaFile = mediaNode?.textContent?.trim();
      const mediaType = mediaNode?.getAttribute('type') || 'video/mp4';

      const clickUrl =
        xml.querySelector('ClickThrough')?.textContent?.trim() || null;

      setClickThrough(clickUrl);

      if (!mediaFile) return;

      player = videojs(videoRef.current!, {
        controls: true,
        autoplay: true,
        muted: true,
        preload: 'auto',
        playsinline: true,
        sources: [
          {
            src: mediaFile,
            type: mediaType,
          },
        ],
      });

      playerRef.current = player;

      player.on('loadedmetadata', () => {
        setDuration(player.duration());
      });

      player.on('timeupdate', () => {
        setCurrentTime(player.currentTime());
      });

      player.on('volumechange', () => {
        setIsMuted(player.muted());
      });

      // ✅ ClickThrough
      if (clickUrl) {
        player.on('click', (e: any) => {
          const isControlBar = e.target.closest('.vjs-control-bar');
          if (!isControlBar) {
            window.open(clickUrl, '_blank');
          }
        });
      }
    };

    init();

    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, [vastUrl]);

  const remaining = Math.max(Math.floor(duration - currentTime), 0);

  return (
    <div className="relative w-full">

      {/* ✅ VIDEO */}
      <video
        ref={videoRef}
        className="video-js vjs-default-skin w-full h-auto"
      />

      {/* ✅ AD BADGE + COUNTDOWN */}
      <div className="absolute top-3 right-3 bg-black/70 text-white text-sm px-3 py-1 rounded-md backdrop-blur-sm">
        تبلیغات • {remaining}ث
      </div>

      {/* ✅ BIG UNMUTE OVERLAY */}
      {isMuted && (
        <div
          onClick={() => {
            playerRef.current?.muted(false);
            playerRef.current?.volume(1);
          }}
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 transition-opacity"
        >
          <div className="bg-white/20 hover:bg-white transition rounded-full px-6 py-4 shadow-xl flex items-center gap-3 text-black font-semibold text-lg">
            🔊
          </div>
        </div>
      )}
    </div>
  );
}
