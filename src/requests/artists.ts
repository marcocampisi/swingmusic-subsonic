import { Album, Artist, Genre, StatItem, Track } from '@/interfaces'
import { subsonicRequest } from '@/utils/subsonic'
import { mapSubsonicAlbum, mapSubsonicArtist, mapSubsonicTrack } from '@/utils/subsonicMapper'

export const getArtistData = async (hash: string, limit: number = 15, albumlimit: number = 7) => {
    interface ArtistData {
        artist: Artist
        tracks: Track[]
        albums: {
            albums: Album[]
            singles_and_eps: Album[]
            appearances: Album[]
            compilations: Album[]
        }
        genres: Genre[]
        stats: StatItem[]
    }

    const data = await subsonicRequest('getArtist.view', { id: hash })

    if (!data || !data.artist) {
        return null
    }

    const artist = data.artist
    const albums = (artist.album || []).map(mapSubsonicAlbum)

    return <ArtistData>{
        artist: mapSubsonicArtist(artist),
        tracks: [],
        albums: {
            albums: albums,
            singles_and_eps: [],
            appearances: [],
            compilations: [],
        },
        genres: [],
        stats: [],
    }
}

export const getArtistAlbums = async (hash: string, limit = 6, all = false) => {
    const data = await getArtistData(hash)
    return data?.albums
}

export const getArtistTracks = async (hash: string) => {
    return []
}

export const getSimilarArtists = async (hash: string, limit = 6) => {
    return []
}

export async function saveArtistAsPlaylist(name: string, hash: string) {
    return null
}
