// Funzioni di supporto per creare la struttura UI nativa (Dati puri, niente funzioni)
const TextInput = (props) => ({ 
  type: 'TEXT_INPUT', 
  label: props.label, 
  settingsKey: props.settingsKey 
})

const Toggle = (props) => ({ 
  type: 'TOGGLE', 
  label: props.label, 
  settingsKey: props.settingsKey 
})

const Section = (props) => ({ 
  type: 'SECTION', 
  title: props.title, 
  rows: props.children 
})

const TextRow = (props) => ({
  type: 'TEXT_ROW',
  label: props.label
})

AppSettingsPage({
  build(props) {
    const storage = props.settingsStorage

    // ASCOLTATORE DEGLI EVENTI
    // Poiché non possiamo usare onClick, ascoltiamo quando cambiano gli interruttori
    storage.addListener('change', ({ key, newValue }) => {
      
      // --- LOGICA AGGIUNTA ---
      // Se l'utente accende l'interruttore "cmd_add"
      if (key === 'cmd_add' && newValue === true) {
        const t = storage.getItem('temp_title')
        const f = storage.getItem('temp_formula')

        if (t && f) {
          // 1. Recupera lista attuale
          let list = []
          try { 
            const existing = storage.getItem('mathData')
            list = existing ? JSON.parse(existing) : []
          } catch(e) {}

          // 2. Aggiungi
          list.push({ title: t, formulas: [f] })

          // 3. Salva (questo attiverà anche l'invio all'orologio via app-side)
          storage.setItem('mathData', JSON.stringify(list))
        }

        // 4. Reset Interruttore (Feedback visivo: si spegne da solo)
        storage.setItem('cmd_add', false)
      }

      // --- LOGICA RESET ---
      // Se l'utente accende l'interruttore "cmd_clear"
      if (key === 'cmd_clear' && newValue === true) {
        storage.setItem('mathData', '[]')
        storage.setItem('cmd_clear', false)
      }
    })

    // COSTRUZIONE INTERFACCIA
    return Section({
      title: 'Gestione Formule',
      children: [
        TextInput({ 
          label: 'Titolo (es. Analisi)', 
          settingsKey: 'temp_title' 
        }),
        TextInput({ 
          label: 'Formula LaTeX', 
          settingsKey: 'temp_formula' 
        }),
        // Usiamo TOGGLE come se fossero pulsanti
        Toggle({ 
          label: '👉 SALVA E INVIA (Attiva)', 
          settingsKey: 'cmd_add' 
        }),
        TextRow({ 
          label: 'Attiva la levetta sopra per salvare.' 
        }),
        Toggle({ 
          label: '🚨 CANCELLA TUTTO', 
          settingsKey: 'cmd_clear' 
        })
      ]
    })
  }
})