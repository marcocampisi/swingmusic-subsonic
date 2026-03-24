import { paths } from "@/config";
import useAxios from "./useAxios";

import { getSubsonicConfig, subsonicRequest } from '@/utils/subsonic'
import { LyricsLine } from '@/interfaces'

function parseLyrics(lyricsData: any): { lyrics: LyricsLine[], synced: boolean, copyright: string } {
  // First, check for OpenSubsonic structuredLyrics
  // It could be passed directly as lyricsData, or inside lyricsData.structuredLyrics
  const structured = lyricsData?.structuredLyrics || (lyricsData?.line ? lyricsData : null)

  if (structured && structured.line && Array.isArray(structured.line)) {
    return {
      lyrics: structured.line.map((l: any) => ({
        time: parseInt(l.start) || 0,
        text: typeof l === 'string' ? l : (l.value || l['#text'] || l._content || l.text || '')
      })),
      synced: true,
      copyright: lyricsData?.copyright || structured.copyright || ''
    }
  }


  // Fallback to text parsing (LRC or plain text)
  const value = typeof lyricsData?.value === 'string' ? lyricsData.value : lyricsData?.value?._content || ''
  if (!value) return { lyrics: [], synced: false, copyright: '' }

  const lines: LyricsLine[] = []
  let synced = false
  // LRC format: [mm:ss.xxx] text or [mm:ss] text
  const lrcRegex = /^\[(\d{1,2}):(\d{2})(?:[.\:](\d{2,3}))?\](.*)$/

  const rawLines = value.split('\n')
  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim()
    if (!trimmed) continue

    const match = trimmed.match(lrcRegex)
    if (match) {
      synced = true
      const mins = parseInt(match[1])
      const secs = parseInt(match[2])
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0
      const time = mins * 60 * 1000 + secs * 1000 + ms
      lines.push({ time, text: match[4].trim() })
    } else {
      lines.push({ time: 0, text: trimmed })
    }
  }

  if (synced) {
    // If it's LRC but first line is time:0, we can keep it, 
    // but if it's missing times for some lines, they will have time 0.
  }

  return { lyrics: lines, synced, copyright: lyricsData?.copyright || '' }
}


export async function getLyrics(filepath: string, trackhash: string, artist?: string, title?: string) {
  const config = getSubsonicConfig()
  if (config.url) {
    let lyricsData: any = null

    // 1. Try getLyricsBySongId (OpenSubsonic)
    try {
      const data = await subsonicRequest('getLyricsBySongId.view', { id: trackhash })
      const list = data?.lyricsList
      lyricsData = list?.structuredLyrics?.[0] || list?.structuredLyrics || list?.lyrics?.[0] || list?.lyrics || data?.lyrics
    } catch (e) {
      console.warn('getLyricsBySongId failed', e)
    }

    // 2. Try getLyrics (Standard Subsonic) as fallback
    if ((!lyricsData || !lyricsData.value) && artist && title) {
      try {
        const data = await subsonicRequest('getLyrics.view', { artist, title })
        lyricsData = data?.lyrics
      } catch (e) {
        console.warn('getLyrics (fallback) failed', e)
      }
    }

    if (!lyricsData) {
      return { lyrics: [], synced: false, exists: false }
    }

    const { lyrics, synced, copyright } = parseLyrics(lyricsData)
    return { lyrics, synced, exists: lyrics.length > 0, copyright }
  }

  const { data } = await useAxios({
    url: paths.api.lyrics,
    props: {
        filepath,
        trackhash,
    },
  });

  return data;
}

export const checkExists = async (filepath: string, trackhash: string, artist?: string, title?: string) => {
  const config = getSubsonicConfig()
  if (config.url) {
    let lyricsData: any = null
    try {
      const data = await subsonicRequest('getLyricsBySongId.view', { id: trackhash })
      const list = data?.lyricsList
      lyricsData = list?.structuredLyrics?.[0] || list?.structuredLyrics || list?.lyrics?.[0] || list?.lyrics || data?.lyrics
    } catch (e) {
      console.warn('checkExists (songId) failed', e)
    }


    if (!lyricsData && artist && title) {
      try {
        const data = await subsonicRequest('getLyrics.view', { artist, title })
        lyricsData = data?.lyrics
      } catch (e) {
        console.warn('checkExists (fallback) failed', e)
      }
    }

    if (!lyricsData) return { exists: false }
    const { lyrics } = parseLyrics(lyricsData)
    return { exists: lyrics.length > 0 }
  }

  const { data } = await useAxios({
    url: paths.api.lyrics + "/check",
    props: {
      filepath,
      trackhash,
    },
  });

  return data;
};



