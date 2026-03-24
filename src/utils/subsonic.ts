import axios from 'axios'
import SparkMD5 from 'spark-md5'

export interface SubsonicConfig {
    url: string
    user: string
    pass: string
    version: string
    client: string
}

let config: SubsonicConfig = (() => {
    const url = localStorage.getItem('subsonic_url')
    const user = localStorage.getItem('subsonic_user')
    const pass = localStorage.getItem('subsonic_pass')
    
    return {
        url: (url && url !== 'undefined') ? url : '',
        user: (user && user !== 'undefined') ? user : '',
        pass: (pass && pass !== 'undefined') ? pass : '',
        version: '1.16.1',
        client: 'swingmusic-webclient',
    }
})()


export function setSubsonicConfig(newConfig: Partial<SubsonicConfig>) {
    Object.assign(config, newConfig)
    if (newConfig.url) localStorage.setItem('subsonic_url', newConfig.url)
    if (newConfig.user) localStorage.setItem('subsonic_user', newConfig.user)
    if (newConfig.pass) localStorage.setItem('subsonic_pass', newConfig.pass)
}

export function getSubsonicConfig() {
    return config
}

function generateToken(password: string, salt: string) {
    try {
        return SparkMD5.hash(password + salt)
    } catch (e) {
        console.warn('MD5 hash generation failed, falling back to plain password', e)
        return null
    }
}


export function getSubsonicParams() {
    const salt = Math.random().toString(36).substring(2, 15)
    const token = generateToken(config.pass, salt)

    if (token) {
        return {
            u: config.user,
            t: token,
            s: salt,
            v: config.version,
            c: config.client,
            f: 'json',
        }
    }

    // Fallback to plain password
    return {
        u: config.user,
        p: config.pass,
        v: config.version,
        c: config.client,
        f: 'json',
    }
}

export function buildSubsonicUrl(endpoint: string, params: Record<string, any> = {}) {
    if (!config.url || config.url === 'undefined' || !config.url.startsWith('http')) return ''
    
    try {
        const url = new URL(`${config.url}/rest/${endpoint}`)
        const allParams = { ...getSubsonicParams(), ...params }

        Object.entries(allParams).forEach(([key, value]) => {
            url.searchParams.append(key, String(value))
        })

        return url.toString()
    } catch (e) {
        console.warn('buildSubsonicUrl failed with invalid URL', config.url)
        return ''
    }
}


export async function subsonicRequest(endpoint: string, params: Record<string, any> = {}) {
    const url = buildSubsonicUrl(endpoint, params)
    if (!url) return null

    const res = await axios.get(url)
    return res.data['subsonic-response']
}
