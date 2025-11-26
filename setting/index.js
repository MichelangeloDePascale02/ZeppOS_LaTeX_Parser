import { gettext } from 'i18n'

AppSettingsPage({
  state: {
    title: '',
    formula: '',
    props: {},
  },

  addFormula() {
    if (!this.state.title || !this.state.formula) return

    // Recupera i dati esistenti dalle impostazioni del telefono
    const currentStr = this.state.props.settingsStorage.getItem('mathData')
    let list = []
    try {
      list = currentStr ? JSON.parse(currentStr) : []
    } catch(e) {}

    // Aggiungi
    list.push({
      title: this.state.title,
      formulas: [this.state.formula]
    })

    // Salva e notifica
    const jsonStr = JSON.stringify(list)
    this.state.props.settingsStorage.setItem('mathData', jsonStr)
    
    // Pulisci i campi (simulato)
    console.log("Formula aggiunta!")
  },

  clearData() {
    this.state.props.settingsStorage.setItem('mathData', '[]')
  },

  build(props) {
    this.state.props = props
    
    return Section({
      title: 'Gestione Formule',
      children: [
        TextInput({
          label: 'Titolo (es. Analisi)',
          onChange: (val) => { this.state.title = val }
        }),
        TextInput({
          label: 'Formula LaTeX',
          onChange: (val) => { this.state.formula = val }
        }),
        Button({
          label: 'AGGIUNGI E INVIA',
          onClick: () => {
            this.addFormula()
          }
        }),
        Button({
          label: 'CANCELLA TUTTO',
          color: 'danger',
          onClick: () => {
            this.clearData()
          }
        }),
        Text({
          paragraph: true,
          text: 'Nota: Dopo aver cliccato "Aggiungi", le formule verranno inviate automaticamente all\'orologio.'
        })
      ]
    })
  }
})