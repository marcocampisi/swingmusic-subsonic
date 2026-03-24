import { Album, StatItem, Track } from '@/interfaces'
import { subsonicRequest } from '@/utils/subsonic'
import { mapSubsonicAlbum, mapSubsonicTrack } from '@/utils/subsonicMapper'

const getAlbumData = async (albumhash: string, albumlimit: number) => {
    interface AlbumData {
        info: Album
        tracks: Track[]
        copyright: string
        extra: {
            track_total: number
            avg_bitrate: number
        }
        stats: StatItem[]
        more_from: {
            [key: string]: Album[]
        }
        other_versions: Album[]
    }

    const data = await subsonicRequest('getAlbum.view', { id: albumhash })

    if (!data || !data.album) {
        return null
    }

    const album = data.album
    const tracks = (album.song || []).map(mapSubsonicTrack)

    return <AlbumData>{
        info: mapSubsonicAlbum(album),
        tracks: tracks,
        copyright: '',
        extra: {
            track_total: tracks.length,
            avg_bitrate: 0,
        },
        stats: [],
        more_from: {},
        other_versions: [],
    }
}

const getAlbumArtists = async (hash: string) => {
    return []
}

const getAlbumBio = async (hash: string) => {
    return null
}

export const getAlbumsFromArtist = async (albumartists: {}, limit: number = 2, base_title: string) => {
    return []
}

export const getAlbumVersions = async (og_album_title: string, albumhash: string) => {
    return []
}

export async function getAlbumTracks(albumhash: string): Promise<Track[]> {
    const data = await getAlbumData(albumhash, 1000)
    return data?.tracks || []
}

export async function getSimilarAlbums(artisthash: string, limit: number = 5): Promise<Album[]> {
    return []
}

export { getAlbumData as getAlbum, getAlbumArtists, getAlbumBio }
