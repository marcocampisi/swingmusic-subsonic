import { Track, Album, Artist } from '@/interfaces'
import { subsonicRequest } from '@/utils/subsonic'
import { mapSubsonicAlbum, mapSubsonicArtist, mapSubsonicTrack } from '@/utils/subsonicMapper'

async function searchTopResults(query: string, limit: number) {
    const data = await subsonicRequest('search3.view', { query, artistCount: limit, albumCount: limit, songCount: limit })
    const res = data?.searchResult3 || data?.searchResult2

    if (!res) {
        return {
            artists: [],
            albums: [],
            tracks: [],
            top_result: null
        }
    }

    const artists = (res.artist || []).map(mapSubsonicArtist)
    const albums = (res.album || []).map(mapSubsonicAlbum)
    const tracks = (res.song || []).map(mapSubsonicTrack)

    let top_result = null
    if (tracks.length) top_result = tracks[0]
    else if (albums.length) top_result = albums[0]
    else if (artists.length) top_result = artists[0]

    return { artists, albums, tracks, top_result }
}

async function searchTracks(query: string, start: number = 0): Promise<{ results: Track[]; more: boolean }> {
    const data = await subsonicRequest('search3.view', { query, songCount: 30, songOffset: start })
    const res = data?.searchResult3 || data?.searchResult2
    const results = (res?.song || []).map(mapSubsonicTrack)
    return { results, more: results.length === 30 }
}

async function searchAlbums(query: string, start: number = 0): Promise<{ results: Album[]; more: boolean }> {
    const data = await subsonicRequest('search3.view', { query, albumCount: 30, albumOffset: start })
    const res = data?.searchResult3 || data?.searchResult2
    const results = (res?.album || []).map(mapSubsonicAlbum)
    return { results, more: results.length === 30 }
}

async function searchArtists(query: string, start: number = 0): Promise<{ results: Artist[]; more: boolean }> {
    const data = await subsonicRequest('search3.view', { query, artistCount: 30, artistOffset: start })
    const res = data?.searchResult3 || data?.searchResult2
    const results = (res?.artist || []).map(mapSubsonicArtist)
    return { results, more: results.length === 30 }
}


export { searchAlbums, searchArtists, searchTracks, searchTopResults }
