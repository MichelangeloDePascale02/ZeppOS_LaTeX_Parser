import * as fs from '@zos/fs'

// Nome del file salvato nella memoria dell'orologio
const DATA_FILE_NAME = 'user_math_data.json'

// I tuoi dati di default (backup se non c'è nessun file)
export const DEFAULT_MATH_DATA = [
  {
    title: "Analisi 1",
    formulas: [
      "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
      "D(x^n) = nx^{n-1}",
      "\\int e^x dx = e^x + c"
    ]
  },
  {
    title: "Fisica",
    formulas: [
      "F = m a",
      "E = mc^2",
      "\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2}"
    ]
  },
  {
    title: "Test Complessi",
    formulas: [
      "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
      "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
    ]
  }
]

// 1. Funzione per LEGGERE i dati (get)
export function getMathData() {
  try {
    // Controlla se il file esiste
    const stat = fs.statSync({ path: DATA_FILE_NAME })
    
    if (stat) {
      // Leggi il file come testo
      const content = fs.readFileSync({ 
        path: DATA_FILE_NAME, 
        options: { encoding: 'utf8' } 
      })
      // Trasforma il testo in oggetto JSON
      if (content) {
        return JSON.parse(content)
      }
    }
  } catch (e) {
    console.log("Nessun file trovato o errore lettura, uso default.")
  }

  // Se qualcosa va storto o è la prima volta, ritorna i dati base
  return DEFAULT_MATH_DATA
}

// 2. Funzione per SALVARE i dati (set)
export function saveMathData(newData) {
  try {
    // Trasforma l'oggetto JSON in stringa
    const content = JSON.stringify(newData)
    
    // Scrivi sul disco
    fs.writeFileSync({
      path: DATA_FILE_NAME,
      data: content,
      options: { encoding: 'utf8' }
    })
    console.log("Salvataggio riuscito!")
    return true
  } catch (e) {
    console.log("Errore durante il salvataggio:", e)
    return false
  }
}