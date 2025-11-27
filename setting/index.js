// setting/index.js

AppSettingsPage({
    state: {
        tempJson: "", // Qui salviamo temporaneamente ciò che scrivi
        props: {},
    },

    setState(props) {
        this.state.props = props;
    },

    build(props) {
        this.setState(props);

        // 1. L'area di testo (Input)
        const inputArea = View(
            {
                style: {
                    marginBottom: '20px',
                    border: '1px solid #eaeaea',
                    borderRadius: '10px',
                    padding: '10px',
                    backgroundColor: '#f5f5f5'
                }
            },
            [
                TextInput({
                    label: 'Incolla qui il tuo JSON array:',
                    bold: true,
                    subStyle: {
                        color: '#333',
                        fontSize: '14px'
                    },
                    // Quando scrivi, aggiorniamo la variabile locale tempJson
                    onChange: (val) => {
                        this.state.tempJson = val
                    }
                })
            ]
        );

        // 2. Il Bottone "Salva e Invia"
        const sendButton = Button({
            label: 'SALVA E INVIA AL BRACCIALE',
            style: {
                fontSize: '16px',
                borderRadius: '20px',
                background: '#409EFF',
                color: 'white',
                width: '100%',
                height: '50px' // Diamo un'altezza fissa per renderlo cliccabile facilmente
            },
            onClick: () => {
                // Logica di invio
                const content = this.state.tempJson;

                /*if (content.length < 1) {
                    // Controllo banale per evitare invii vuoti
                    return;
                }*/

                console.log(content);

                // SALVATAGGIO: Questo attiva l'evento in app-side/index.js
                props.settingsStorage.setItem('mathData', content);
                console.log(content);
            }
        });

        // 3. Contenitore principale
        return View(
            {
                style: {
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column'
                }
            },
            [
                inputArea,
                sendButton,
                // Un piccolo testo di aiuto
                Text({
                    paragraph: true,
                    style: { marginTop: '15px', color: '#888', fontSize: '12px' },
                    text: 'Nota: Incolla un array JSON valido. I dati verranno sovrascritti sul dispositivo.'
                })
            ]
        );
    }
});