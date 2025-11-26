import { createWidget, widget, align } from '@zos/ui'
import { push } from '@zos/router'
import { getMathData, saveMathData } from '../utils/data'
import { BasePage } from '@zeppos/zml/base-page'

// WRAPPER FONDAMENTALE PER EVITARE L'ERRORE
Page(BasePage({
  state: {
    files: []
  },

  onInit() {
    console.log("PAGE: Init")
    
    // 1. Carica dati dal file system locale
    this.loadLocalData()

    // 2. Chiedi al telefono se ci sono aggiornamenti (Sync iniziale)
    this.request({ method: 'GET_DATA' })
      .then((data) => {
        console.log("PAGE: Sync Iniziale ricevuto")
        if (data && data.result) {
          this.handleNewData(data.result)
        }
      })
      .catch((e) => console.log("PAGE: Sync fallito o offline", e))
  },

  // Chiamato automaticamente da ZML quando il telefono manda dati (via this.call)
  onCall(req) {
    console.log("PAGE: Dati ricevuti in tempo reale")
    if (req && req.result) {
      this.handleNewData(req.result)
    }
  },

  handleNewData(jsonString) {
    try {
      const newData = JSON.parse(jsonString)
      if (Array.isArray(newData)) {
        saveMathData(newData) // Salva su disco
        this.loadLocalData()  // Ricarica stato
        this.rebuildList()    // Aggiorna UI
      }
    } catch (e) {
      console.log("PAGE: Errore parsing dati ricevuti", e)
    }
  },

  loadLocalData() {
    this.state.files = getMathData()
    console.log("PAGE: Dati caricati, elementi:", this.state.files.length)
  },

  build() {
    // Titolo Fisso
    createWidget(widget.TEXT, {
      x: 0, y: 20, w: 466, h: 32,
      text: 'LaTeX Parser',
      color: 0xe94537, text_size: 28, align_h: align.CENTER_H
    })

    // Costruisci la lista iniziale
    this.rebuildList()
  },

  rebuildList() {
    // Rimuovi lista precedente se necessario (opzionale, qui sovrascriviamo solo i dati se il widget lo supporta, 
    // ma SCROLL_LIST in ZOS spesso richiede pulizia o ridisegno totale per cambiare array. 
    // Per semplicità qui ridisegniamo sopra o creiamo se non esiste.
    // Nota: In produzione sarebbe meglio usare deleteWidget se la lista cambia dimensione drasticamente.)

    const files = this.state.files || []
    
    const dataList = files.map((item) => {
      return {
        name: item.title || "???",
        title: item.title,
        formulas: item.formulas || []
      }
    })

    // Se non ci sono dati, mostra avviso
    if (dataList.length === 0) {
        createWidget(widget.TEXT, {
            x: 0, y: 100, w: 480, h: 100,
            text: "Nessuna formula.\nAggiungine dal telefono!",
            color: 0xffffff, text_size: 24, align_h: align.CENTER_H
        })
        return
    }

    createWidget(widget.SCROLL_LIST, {
      x: 83, y: 80, w: 300, h: 434, item_space: 12,
      item_config: [{
        type_id: 1, item_height: 80, item_bg_color: 0x333333, item_bg_radius: 20,
        text_view: [{ x: 0, y: 0, w: 300, h: 80, key: 'name', color: 0xffffff, text_size: 28, align_h: align.CENTER_H, align_v: align.CENTER_V }],
        text_view_count: 1
      }],
      item_config_count: 1,
      data_type_config: [{ start: 0, end: dataList.length - 1, type_id: 1 }],
      data_type_config_count: 1,
      data_count: dataList.length,
      data_array: dataList,

      item_click_func: (list, index, data) => {
        const source = dataList[index]
        push({
          url: 'page/detail',
          params: { fileData: JSON.stringify({ title: source.title, formulas: source.formulas }) }
        })
      }
    })
  }
}))