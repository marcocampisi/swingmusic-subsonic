import { favType } from '@/enums'
import { subsonicRequest } from '@/utils/subsonic'
import { mapSubsonicAlbum, mapSubsonicArtist, mapSubsonicTrack } from '@/utils/subsonicMapper'
import { Album, Artist, Track } from '@/interfaces'

export async function addFavorite(favtype: favType, itemhash: string) {
    let params: any = {}
    if (favtype === favType.track) params.id = itemhash
    if (favtype === favType.album) params.albumId = itemhash
    if (favtype === favType.artist) params.artistId = itemhash

    const data = await subsonicRequest('star.view', params)
    return !!data
}

export async function removeFavorite(favtype: favType, itemhash: string) {
    let params: any = {}
    if (favtype === favType.track) params.id = itemhash
    if (favtype === favType.album) params.albumId = itemhash
    if (favtype === favType.artist) params.artistId = itemhash

    const data = await subsonicRequest('unstar.view', params)
    return !!data
}

export async function getAllFavs(track_limit = 6, album_limit = 6, artist_limit = 6) {
    const data = await subsonicRequest('getStarred.view')
    if (!data || !data.starred) return { tracks: [], albums: [], artists: [] }

    return {
        tracks: (data.starred.song || []).map(mapSubsonicTrack).slice(0, track_limit),
        albums: (data.starred.album || []).map(mapSubsonicAlbum).slice(0, album_limit),
        artists: (data.starred.artist || []).map(mapSubsonicArtist).slice(0, artist_limit),
    }
}

export async function getFavAlbums(start=0, limit = 6) {
    const data = await subsonicRequest('getStarred.view')
    const albums = (data?.starred?.album || []).map(mapSubsonicAlbum)
    return { albums: albums.slice(start, start + limit), total: albums.length }
}

export async function getFavTracks(start = 0, limit = 5) {
    const data = await subsonicRequest('getStarred.view')
    const tracks = (data?.starred?.song || []).map(mapSubsonicTrack)
    return { tracks: tracks.slice(start, start + limit), total: tracks.length }
}

export async function getFavArtists(start = 0, limit = 6) {
    const data = await subsonicRequest('getStarred.view')
    const artists = (data?.starred?.artist || []).map(mapSubsonicArtist)
    return { artists: artists.slice(start, start + limit), total: artists.length }
}

export async function isFavorite(itemhash: string, type: favType) {
    // This is hard with subsonic as we have to fetch all starred and check.
    // For now we assume if it's fetched from Subsonic with 'starred' property it's already marked in the UI.
    return false
}
