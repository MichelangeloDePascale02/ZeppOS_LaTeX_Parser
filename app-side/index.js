import { BaseSideService } from '@zeppos/zml/base-side'

AppSideService({
  onInit() {
    // Ascolta i cambiamenti nelle impostazioni
    this.settingsStorage.addListener('change', ({ key, newValue }) => {
      
      // 1. GESTIONE AGGIUNTA FORMULA
      if (key === 'cmd_add' && newValue === true) {
        const t = this.settingsStorage.getItem('temp_title')
        const f = this.settingsStorage.getItem('temp_formula')

        if (t && f) {
          let list = []
          try { 
            const existing = this.settingsStorage.getItem('mathData')
            // Gestione robusta: se è vuoto o null, usa array vuoto
            list = existing ? JSON.parse(existing) : []
          } catch(e) {
            console.log("Errore parsing mathData", e)
          }

          // Aggiungi nuova formula
          list.push({ title: t, formulas: [f] })

          // Salva (questo attiverà l'evento 'mathData' qui sotto)
          this.settingsStorage.setItem('mathData', JSON.stringify(list))
        }

        // Reset interruttore (spegne la levetta nelle impostazioni)
        this.settingsStorage.setItem('cmd_add', false)
      }

      // 2. GESTIONE CANCELLAZIONE
      if (key === 'cmd_clear' && newValue === true) {
        this.settingsStorage.setItem('mathData', '[]')
        this.settingsStorage.setItem('cmd_clear', false)
      }

      // 3. INVIO DATI ALL'OROLOGIO
      // Scatta quando 'mathData' viene modificato (anche dai comandi sopra)
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