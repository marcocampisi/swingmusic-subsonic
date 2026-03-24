import { Folder, Track } from '@/interfaces'
import { getSubsonicConfig, subsonicRequest } from '@/utils/subsonic'
import { mapSubsonicTrack } from '@/utils/subsonicMapper'

export async function getFiles(
    path: string,
    start: number,
    limit: number,
) {
    interface FolderData {
        tracks: Track[]
        folders: Folder[]
        path: string
        total: number
    }

    const config = getSubsonicConfig()
    if (!config.url) {
        return <FolderData>{ path: '', tracks: [], folders: [], total: 0 }
    }

    let endpoint = 'getMusicDirectory.view'
    let params: any = { id: path }

    if (!path || path === '$home' || path === '/') {
        endpoint = 'getIndexes.view'
        params = {}
    }

    const data = await subsonicRequest(endpoint, params)

    if (!data) {
        return <FolderData>{ path: '', tracks: [], folders: [], total: 0 }
    }

    const folders: Folder[] = []
    const tracks: Track[] = []

    if (endpoint === 'getIndexes.view') {
        const indexes = data.indexes
        if (indexes && indexes.index) {
            indexes.index.forEach((idx: any) => {
                idx.artist.forEach((artist: any) => {
                    folders.push({
                        name: artist.name,
                        path: artist.id,
                        has_tracks: 0,
                        is_sym: false,
                        trackcount: 0,
                        foldercount: 0,
                    })
                })
            })
        }
    } else {
        const directory = data.directory
        if (directory && directory.child) {
            directory.child.forEach((child: any) => {
                if (child.isDir) {
                    folders.push({
                        name: child.title || child.name,
                        path: child.id,
                        has_tracks: 0,
                        is_sym: false,
                        trackcount: 0,
                        foldercount: 0,
                    })
                } else {
                    tracks.push(mapSubsonicTrack(child))
                }
            })
        }
    }

    return <FolderData>{
        path: path,
        tracks,
        folders,
        total: folders.length + tracks.length,
    }
}

export async function openInFiles(path: string) {
    console.log('Open in files not supported for Subsonic')
}

export async function getTracksInPath(path: string) {
    const res = await getFiles(path, 0, 1000)
    return res.tracks
}
