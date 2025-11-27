// app-side/index.js

console.log("!!! APP-SIDE FILE CARICATO !!!");
import { BaseSideService } from '@zeppos/zml/base-side'

function getMaths() {
    return this.settingsStorage.getItem('mathData')
}

AppSideService(
    BaseSideService({
        onInit() {
            console.log("APP-SIDE: Inizializzato");
        },
        onRequest(req, res) {
            if (req.method === 'GET_DATA') {
                res(null, {
                    result: getMaths()
                })
            }
        },
        onSettingsChange({ key, newValue, oldValue }) {
            this.call({
                result: getMaths()
            })
        },
        onRun() { },
        onDestroy() { }
    })
)