import { BaseSideService } from '@zeppos/zml/base-side'

AppSideService({
  onInit() {
    // Ascolta i cambiamenti nelle impostazioni
    this.settingsStorage.addListener('change', ({ key, newValue }) => {
      if (key === 'mathData') {
        this.sendData(newValue)
      }
    })
  },

  sendData(dataStr) {
    console.log("AppSide: Invio dati all'orologio...")
    this.call({
      result: dataStr
    })
  },

  onRequest(req, res) {
    console.log("AppSide: Richiesta ricevuta", req.method)
    if (req.method === 'GET_DATA') {
      const data = this.settingsStorage.getItem('mathData')
      this.call({ result: data || '[]' })
    }
  }
})