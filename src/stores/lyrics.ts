import { defineStore } from "pinia";

import useLyricsPlugin from "./plugins/lyrics";
import useQueue from "./queue";
import useSettings from "./settings";

import { LyricsLine } from "@/interfaces";
import { checkExists, getLyrics } from "@/requests/lyrics";
import { getSubsonicConfig } from "@/utils/subsonic";
import { Routes, router } from "@/router";

// a custom error class called HasNoSyncedLyricsError
class HasUnSyncedLyricsError extends Error {
  constructor() {
    super("Lyrics are not synced");
    this.name = "HasNoSyncedLyricsError";
  }
}

export default defineStore("lyrics", {
  state: () => ({
    lyrics: <LyricsLine[]>[],
    currentLine: -1,
    ticking: false,
    currentTrack: "",
    exists: false,
    synced: true,
    copyright: "",
    user_scrolled: false,
  }),
  actions: {
    async getLyrics(force = false) {
      const queue = useQueue();
      const track = queue.currenttrack;

      if (!force && this.currentTrack === track.trackhash) {
        this.sync();
        return;
      }

      this.currentLine = -1;
      this.copyright = "";
      this.synced = true;

      getLyrics(track.filepath, track.trackhash, track.artists[0]?.name, track.title)
        .then((data) => {
          this.currentTrack = track.trackhash;

          if (data.error) {
            throw new Error(data.error);
          }

          this.synced = data.synced;
          this.lyrics = data.lyrics;
          this.copyright = data.copyright;
          this.exists = true;

          if (this.lyrics.length && !this.synced) {
            throw new HasUnSyncedLyricsError();
          }

        })
        .then(async () => {
          const line = this.calculateCurrentLine();
          this.setCurrentLine(line);
        })
        .catch((e) => {
          const settings = useSettings();
          const plugin = useLyricsPlugin();

          if (e instanceof HasUnSyncedLyricsError) {
            if (!getSubsonicConfig().url && !settings.lyrics_plugin_settings.overide_unsynced) {
              return;
            }
            plugin.searchLyrics();
            return;
          }


          this.exists = false;
          this.lyrics = <LyricsLine[]>[];
          this.copyright = "";

          if (getSubsonicConfig().url || settings.lyrics_plugin_settings.auto_download) {
            plugin.searchLyrics();
          }

        });


    },
    scrollToContainerTop() {
      const container = document.getElementById("lyricscontent");

      if (container) {
        container.scroll({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    checkExists(filepath: string, trackhash: string) {
      if (router.currentRoute.value.name !== Routes.Lyrics) {
        this.lyrics = <LyricsLine[]>[];
      }

      const queue = useQueue()
      const track = queue.currenttrack

      if (!track || !track.artists) return;

      const artist = track.artists[0]?.name || "";
      const title = track.title || "";

      checkExists(filepath, trackhash, artist, title).then((data) => {
        if (data) {
          this.exists = data.exists;
        }
      });
    },

    setNextLineTimer(duration: number) {
      this.ticking = true;
      setTimeout(() => {
        if (useQueue().playing) {
          this.currentLine++;
          this.ticking = false;
          this.scrollToCurrentLine();
        }
      }, duration - 300);
    },
    setCurrentLine(line: number, scroll = true) {
      this.currentLine = line;
      this.ticking = false;

      if (!scroll) return;
      setTimeout(() => {
        this.scrollToCurrentLine();
      }, 400);
    },
    scrollToCurrentLine(line: number = -1) {
      let lineToScroll = this.currentLine;

      if (line >= 0) {
        lineToScroll = line;
      }

      const third = window.innerHeight / 3;
      const two_thirds = third * 2;

      const elem = document.getElementById(`lyricsline-${lineToScroll}`);
      if (!elem) return;

      const { y } = elem.getBoundingClientRect();

      if (this.user_scrolled && (y < third || y > two_thirds)) {
        return;
      }

      this.setUserScrolled(false);
      elem.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
    },
    calculateCurrentLine() {
      if (!this.lyrics.length || !this.synced) return -1;

      const queue = useQueue();
      const millis = queue.duration.current * 1000;

      let index = -1;
      for (let i = 0; i < this.lyrics.length; i++) {
        if (this.lyrics[i].time <= millis) {
          index = i;
        } else {
          break;
        }
      }

      return index;
    },

    sync() {
      const line = this.calculateCurrentLine();
      this.setCurrentLine(line);
    },
    setLyrics(lyrics: LyricsLine[], synced: boolean = true) {
      this.lyrics = lyrics;
      this.synced = synced;
      this.exists = true;
      this.currentTrack = useQueue().currenttrackhash;

      this.setCurrentLine(this.currentLine);
    },

    setUserScrolled(value: boolean) {
      this.user_scrolled = value;
    },
  },
  getters: {
    nextLineTime(): number {
      if (!this.lyrics) return 0;
      if (this.lyrics.length > this.currentLine + 1) {
        return this.lyrics[this.currentLine + 1].time;
      }

      return 0;
    },
  },
});
