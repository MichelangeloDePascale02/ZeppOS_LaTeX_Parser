// 1. RIMUOVI TUTTE le funzioni costanti (TextInput, Toggle, Section, TextRow) che avevi scritto qui in alto.
// In Zepp OS Settings API (v2/v3), questi componenti sono già disponibili globalmente.

AppSettingsPage({
  build(props) {
    // Usa direttamente Section, TextInput e Toggle offerti dal sistema
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
        Toggle({ 
          label: '👉 SALVA E INVIA (Attiva)', 
          settingsKey: 'cmd_add' 
        }),
        // "TextRow" non esiste. Usiamo "Text" per le etichette semplici.
        Text({ 
          style: { fontSize: '12px', color: '#888888', marginBottom: '10px' },
          children: 'Attiva la levetta sopra per salvare.' 
        }),
        Toggle({ 
          label: '🚨 CANCELLA TUTTO', 
          settingsKey: 'cmd_clear' 
        })
      ]
    })
  }
})