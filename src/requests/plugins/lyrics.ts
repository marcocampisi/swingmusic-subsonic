import { paths } from "@/config";
import useAxios from "../useAxios";

import axios from 'axios'
import { getSubsonicConfig } from '@/utils/subsonic'

export async function findLyrics(
  title: string,
  artist: string,
  filepath: string,
  album: string,
  trackhash: string
) {
  const config = getSubsonicConfig()
  if (config.url) {
    try {
      let data: any = null;
      try {
        const res = await axios.get('https://lrclib.net/api/get', {
          params: { track_name: title, artist_name: artist, album_name: album }
        });
        if (res.data.syncedLyrics) {
          data = res.data;
        }
      } catch (e) {
        // Ignored
      }
      
      if (!data) {
        try {
          const searchRes = await axios.get('https://lrclib.net/api/search', {
            params: { q: `${artist} ${title}` }
          });
          
          if (searchRes.data && Array.isArray(searchRes.data)) {
            // Find first one with synced lyrics
            const synced = searchRes.data.find((item: any) => item.syncedLyrics);
            if (synced) {
              data = synced;
            } else if (searchRes.data.length > 0) {
              // Fallback to first plain lyrics result
              data = searchRes.data[0];
            }
          }
        } catch (e) {
          console.warn("Failed to search lyrics from LRCLIB", e);
        }
      }
      
      if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
        return null; // Not found
      }
      
      const { plainLyrics, syncedLyrics } = data;
      const value = syncedLyrics || plainLyrics || '';
      
      const lines: any[] = [];
      let synced = false;
      const lrcRegex = /^\[(\d{1,2}):(\d{2})(?:[.\:](\d{2,3}))?\](.*)$/;

      const rawLines = value.split('\n');
      for (const rawLine of rawLines) {
        const trimmed = rawLine.trim();
        if (!trimmed) continue;

        const match = trimmed.match(lrcRegex);
        if (match) {
          synced = true;
          const mins = parseInt(match[1]);
          const secs = parseInt(match[2]);
          const ms = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0;
          const time = mins * 60 * 1000 + secs * 1000 + ms;
          lines.push({ time, text: match[4].trim() });
        } else {
          lines.push({ time: 0, text: trimmed });
        }
      }
      
      return { lyrics: lines, synced, trackhash };
    } catch (e) {
      console.warn("Fatal LRCLIB error", e);
      return null;
    }
  }

  const { data } = await useAxios({
    url: paths.api.plugins + "/lyrics/search",
    props: {
        trackhash,
        title,
        artist,
        filepath,
        album,
    },
  });

  return data;
}



