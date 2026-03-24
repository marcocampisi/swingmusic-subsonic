import { Album, HomePageItem } from '@/interfaces'
import { subsonicRequest } from '@/utils/subsonic'
import { mapSubsonicAlbum } from '@/utils/subsonicMapper'

export async function getRecentlyAdded(limit: number) {
    const data = await subsonicRequest('getAlbumList2.view', { type: 'newest', size: limit })
    const list = data?.albumList2 || data?.albumList
    return (list?.album || []).map(mapSubsonicAlbum)
}

export async function getRecentlyPlayed(limit: number) {
    const data = await subsonicRequest('getAlbumList2.view', { type: 'recent', size: limit })
    const list = data?.albumList2 || data?.albumList
    return (list?.album || []).map(mapSubsonicAlbum)
}


export async function getHomePageData(limit: number) {
    const newest = await getRecentlyAdded(limit)
    const recent = await getRecentlyPlayed(limit)

    return [
        {
            recently_added: {
                title: 'Recently Added',
                items: newest.map((a: Album) => ({ type: 'album', item: a })),
            },
        },
        {
            recently_played: {
                title: 'Recently Played',
                items: recent.map((a: Album) => ({ type: 'album', item: a })),
            },
        },
    ] as any
}
