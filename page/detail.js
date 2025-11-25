import { createWidget, widget, align } from '@zos/ui'
import { drawCenteredFormula } from '../utils/math' 

Page({
  state: {
    fileData: null
  },

  onInit(params) {
    console.log("Detail Init");
    if(!params) return;
    try {
        const paramObj = JSON.parse(params)
        // Gestione robusta del parsing
        this.state.fileData = (typeof paramObj.fileData === 'string') 
            ? JSON.parse(paramObj.fileData) 
            : paramObj.fileData
    } catch (e) {
        console.log("Errore parsing params:", e)
    }
  },

  build() {
    // 2. Controllo Dati
    if (!this.state.fileData) {
        createWidget(widget.TEXT, {
            x: 0, y: 200, w: 480, h: 100,
            text: "ERRORE: Dati mancanti",
            color: 0xFF0000, 
            text_size: 30, 
            align_h: align.CENTER_H
        })
        return
    }

    // 3. HARDCODE: Usiamo 30px fisso per ora. 
    // Se questo funziona, sappiamo che il problema era solo il salvataggio dati.
    const baseSize = 30
    const screenWidth = 480

    // 4. Titolo
    createWidget(widget.TEXT, {
        x: 0, y: 20, w: screenWidth, h: 50,
        text: this.state.fileData.title,
        color: 0xFFAA00, 
        text_size: 36,
        align_h: align.CENTER_H
    })

    let currentY = 80 

    // 5. Disegno Formule
    if (this.state.fileData.formulas) {
        this.state.fileData.formulas.forEach((formula) => {
            // Log per vedere quale formula sta disegnando
            console.log("Disegno:", formula);
            
            try {
                drawCenteredFormula(currentY, formula, baseSize, screenWidth)
            } catch (err) {
                console.log("Errore math:", err)
            }
            
            currentY += (baseSize * 2.5)
        })
    }
  }
})