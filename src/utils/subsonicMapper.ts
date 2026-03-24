import { Album, Artist, Playlist, Track } from '@/interfaces'
import { buildSubsonicUrl } from './subsonic'

export function mapSubsonicTrack(s: any): Track {
    return {
        type: 'track',
        id: s.id,
        title: s.title,
        album: s.album,
        artists: [{ name: s.artist, artisthash: s.artistId, image: '', trackcount: 0, albumcount: 0, duration: 0, color: '', genres: [] }],
        albumartists: [{ name: s.artist, artisthash: s.artistId, image: '', trackcount: 0, albumcount: 0, duration: 0, color: '', genres: [] }],
        albumhash: s.albumId,
        filepath: s.path,
        duration: s.duration,
        bitrate: s.bitRate,
        image: buildSubsonicUrl('getCoverArt.view', { id: s.id }),
        track: s.track,
        disc: s.discNumber || 1,
        index: s.track,
        trackhash: s.id,
        filetype: s.suffix,
        is_favorite: s.starred !== undefined,
        explicit: false,
        og_title: s.title,
        og_album: s.album,
    }
}

export function mapSubsonicAlbum(a: any): Album {
    return {
        type: 'album',
        albumid: a.id,
        title: a.name || a.title,
        og_title: a.name || a.title,
        base_title: a.name || a.title,
        albumartists: [{ name: a.artist, artisthash: a.artistId, image: '', trackcount: 0, albumcount: 0, duration: 0, color: '', genres: [] }],
        trackcount: a.songCount || 0,
        duration: 0,
        date: a.year || 0,
        image: buildSubsonicUrl('getCoverArt.view', { id: a.coverArt || a.id }),
        artistimg: '',
        albumhash: a.id,
        is_favorite: a.starred !== undefined,
        genres: [],
        versions: [],
    }
}

export function mapSubsonicArtist(a: any): Artist {
    return {
        type: 'artist',
        name: a.name,
        image: buildSubsonicUrl('getCoverArt.view', { id: a.coverArt || a.id }),
        artisthash: a.id,
        trackcount: 0,
        albumcount: a.albumCount || 0,
        duration: 0,
        color: '',
        genres: [],
        is_favorite: a.starred !== undefined,
    }
}

export function mapSubsonicPlaylist(p: any): Playlist {
    return {
        id: p.id,
        name: p.name,
        image: buildSubsonicUrl('getCoverArt.view', { id: p.coverArt || `p-${p.id}` }),
        has_image: !!p.coverArt,
        tracks: [],
        count: p.songCount || 0,
        _last_updated: p.changed || p.created || '',
        thumb: buildSubsonicUrl('getCoverArt.view', { id: p.coverArt || `p-${p.id}`, size: 100 }),
        duration: p.duration || 0,
        settings: {
            banner_pos: 50,
            has_gif: false,
            square_img: false,
            pinned: false,
        },
        pinned: false,
        images: [],
    }
}
