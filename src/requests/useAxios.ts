import { FetchProps } from '@/interfaces'
import axios from 'axios'
import useModal from '@/stores/modal'

import useLoaderStore from '@/stores/loader'
import { logoutUser } from './auth'
import { buildSubsonicUrl, getSubsonicConfig } from '@/utils/subsonic'

if (window.location.protocol === 'https:') {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = 'upgrade-insecure-requests';
    document.head.appendChild(meta);
}

export default async (args: FetchProps, withCredentials: boolean = true) => {
    const subsonicConfig = getSubsonicConfig()
    const isSubsonic = subsonicConfig.url !== ''

    let url = args.url
    let method = args.method || 'POST'
    let params = args.props || {}

    if (isSubsonic && !url.startsWith('http')) {
        // This is a relative path that we should probably map to a Subsonic endpoint
        // For now, let's assume the caller provides the Subsonic endpoint if they intended to use it,
        // OR we map known paths here.
        // But since we want to "replace" the current APIs, we should probably do the mapping in the request files.
    }

    const on_ngrok = url.includes('ngrok')
    const ngrok_config = {
        'ngrok-skip-browser-warning': 'stupid-SOAB!',
    }

    const { startLoading, stopLoading } = useLoaderStore()
    startLoading()

    try {
        const res = await axios({
            url: url,
            params: method === 'GET' ? params : {},
            data: method !== 'GET' ? params : {},
            method: method,
            headers: { ...args.headers, ...(on_ngrok ? ngrok_config : {}) },
            withCredentials: withCredentials,
        })

        stopLoading()
        return {
            data: res.data,
            status: res.status,
        }
    } catch (error: any) {
        stopLoading()

        // was unauthorized
        if (error.response?.status === 401) {
            useModal().showLoginModal()
        }

        // server config folder nuked which can
        // can cause a signature mismatch error
        // console.log(error.response.data.msg == "Signature verification failed")
        let isSignatureError = false

        try {
            isSignatureError = error.response?.data?.msg == 'Signature verification failed'
        } catch (error) {
            console.error('Error:', error)
        }

        if (error.response?.status === 422 && isSignatureError) {
            await logoutUser()
            useModal().showLoginModal()
        }

        return {
            error: error.message,
            data: error.response?.data,
            status: error.response?.status,
        }
    }
}

// TODO: Set base url in axios config
