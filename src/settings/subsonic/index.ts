import { SettingType } from '../enums'
import { getSubsonicConfig, setSubsonicConfig } from '@/utils/subsonic'

const subsonic = {
    title: 'Subsonic',
    groups: [
        {
            title: 'Subsonic Settings',
            desc: 'Configure your Subsonic server details',
            settings: [
                {
                    title: 'Server URL',
                    desc: 'The URL of your Subsonic server (e.g., http://192.168.1.10:4040)',
                    type: SettingType.secretinput,
                    state: () => getSubsonicConfig().url,
                    action: (val: string) => setSubsonicConfig({ url: val }),
                },
                {
                    title: 'Username',
                    desc: 'Your Subsonic username',
                    type: SettingType.secretinput,
                    state: () => getSubsonicConfig().user,
                    action: (val: string) => setSubsonicConfig({ user: val }),
                },
                {
                    title: 'Password',
                    desc: 'Your Subsonic password',
                    type: SettingType.secretinput,
                    state: () => getSubsonicConfig().pass,
                    action: (val: string) => setSubsonicConfig({ pass: val }),
                },
            ],
        },
    ],
}

export default subsonic
