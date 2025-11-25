import { createWidget, widget, getTextLayout } from '@zos/ui'

const symbolMap = {
  '\\sum': '∑', 
  '\\alpha': 'α', '\\beta': 'β', '\\pi': 'π', '\\Delta': 'Δ',
  '\\to': '→', '\\infty': '∞', 
  '\\sin': 'sin', '\\cos': 'cos', '\\ln': 'ln', '\\lim': 'lim',
  '\\le': '≤', '\\ge': '≥', '\\neq': '≠', '\\approx': '≈', '\\pm': '±',
  '\\cdot': '·', '\\int': '∫', '\\prod': '∏', '\\sqrt': '√'
}

function parseGroup(text, startIndex) {
  if (text[startIndex] !== '{') {
      return { content: text[startIndex], endIndex: startIndex }
  }
  let depth = 1
  let i = startIndex + 1
  let content = ''
  while (i < text.length && depth > 0) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') depth--
    if (depth > 0) content += text[i]
    i++
  }
  return { content: content, endIndex: i - 1 }
}

function replaceSymbols(text) {
  let processed = text
  for (const [key, value] of Object.entries(symbolMap)) {
    const regex = new RegExp(key.replace(/\\/g, '\\\\'), 'g')
    processed = processed.replace(regex, value)
  }
  return processed
}

function processText(startX, startY, rawText, baseSize, dryRun) {
  let cursorX = startX
  let i = 0
  
  const subRatio = 0.5
  const fracRatio = 0.75
  const supOffset = baseSize * 0.15 // Spostato un po' più in alto
  const subOffset = baseSize * 0.5 // Spostato un po' più in basso

  while (i < rawText.length) {
    const char = rawText[i]

    // 1. GESTIONE FRAZIONI (Invariato)
    if (rawText.startsWith('\\frac', i)) {
        const numGroup = parseGroup(rawText, i + 5)
        const denGroup = parseGroup(rawText, numGroup.endIndex + 1)
        const fracSize = baseSize * fracRatio
        const numWidth = processText(0, 0, numGroup.content, fracSize, true)
        const denWidth = processText(0, 0, denGroup.content, fracSize, true)
        const totalFracWidth = Math.max(numWidth, denWidth)
        
        if (!dryRun) {
            const numY = startY - (fracSize * 0.6)
            const denY = startY + (fracSize * 0.8)
            const lineY = startY + (baseSize * 0.5)
            processText(cursorX + (totalFracWidth - numWidth) / 2, numY, numGroup.content, fracSize, false)
            createWidget(widget.FILL_RECT, { x: cursorX, y: lineY, w: totalFracWidth, h: 2, color: 0xffffff })
            processText(cursorX + (totalFracWidth - denWidth) / 2, denY, denGroup.content, fracSize, false)
        }
        cursorX += totalFracWidth + 2
        i = denGroup.endIndex + 1
        continue
    }

    // 2. GESTIONE CARATTERI NORMALI E SIMBOLI
    if (char === '{' || char === '}') { i++; continue; }
    
    // Ignoriamo ^ e _ qui se sono "solitari" (verranno presi nel prossimo ciclo se non sono attaccati a un simbolo)
    // Ma se siamo qui, stiamo cercando un "Base Char" (lettera o simbolo)
    if (char === '^' || char === '_') {
        // Fallback per apici/pedici orfani (es. dopo una frazione)
        // Usiamo la logica semplice "avanti veloce"
        const mode = (char === '^') ? 'super' : 'sub'
        const group = parseGroup(rawText, i + 1)
        const currentSubSize = baseSize * subRatio
        const subWidth = processText(0, 0, group.content, currentSubSize, true)
        const subY = (mode === 'super') ? startY - supOffset : startY + subOffset
        if (!dryRun) processText(cursorX, subY, group.content, currentSubSize, false)
        cursorX += subWidth
        i = group.endIndex + 1
        continue
    }

    // -- RICONOSCIMENTO BASE CHAR --
    let textToDraw = char
    let charLength = 1
    if (char === '\\') {
        for (const key of Object.keys(symbolMap)) {
             if (rawText.startsWith(key, i)) {
                 textToDraw = symbolMap[key]
                 charLength = key.length
                 break
             }
        }
    }

    let charW = 0
    try {
        const layout = getTextLayout(textToDraw, { text_size: baseSize, text_width: 0, wrapped: 0 })
        charW = (layout && layout.width > 0) ? layout.width : baseSize / 2
    } catch(e) { charW = baseSize / 2 }

    if (!dryRun) {
        let adjustY = startY
        // Opzionale: Centra meglio simboli come la sommatoria
        if (textToDraw === '∑' || textToDraw === '∫') adjustY -= (baseSize * 0.1)

        createWidget(widget.TEXT, {
            x: cursorX, y: adjustY, w: charW + 10, h: baseSize * 1.5,
            text_size: baseSize, color: 0xffffff, text: textToDraw
        })
    }

    // Spostiamo il cursore DOPO il carattere base
    let nextX = cursorX + charW
    let nextIndex = i + charLength

    // --- 3. COMBINED STACK CHECK (La Magia è Qui) ---
    // Controlliamo se dopo questo carattere ci sono SIA _ che ^ (in qualsiasi ordine)
    let subGroup = null
    let supGroup = null
    let consumedLength = 0

    // Caso A: Prima Pedice, poi Apice (Es: x_0^2)
    if (rawText[nextIndex] === '_') {
        const tempSub = parseGroup(rawText, nextIndex + 1)
        // Guarda ancora avanti
        if (rawText[tempSub.endIndex + 1] === '^') {
             const tempSup = parseGroup(rawText, tempSub.endIndex + 2)
             subGroup = tempSub
             supGroup = tempSup
             consumedLength = (tempSup.endIndex + 1) - nextIndex
        }
    }
    // Caso B: Prima Apice, poi Pedice (Es: x^2_0)
    else if (rawText[nextIndex] === '^') {
        const tempSup = parseGroup(rawText, nextIndex + 1)
        // Guarda ancora avanti
        if (rawText[tempSup.endIndex + 1] === '_') {
             const tempSub = parseGroup(rawText, tempSup.endIndex + 2)
             subGroup = tempSub
             supGroup = tempSup
             consumedLength = (tempSub.endIndex + 1) - nextIndex
        }
    }

    // Se abbiamo trovato ENTRAMBI, li disegniamo IMPILATI
    if (subGroup && supGroup) {
        const subSize = baseSize * subRatio
        
        // Calcolo larghezze
        const subW = processText(0, 0, subGroup.content, subSize, true)
        const supW = processText(0, 0, supGroup.content, subSize, true)
        
        if (!dryRun) {
            // Disegna Pedice
            processText(nextX, startY + subOffset, subGroup.content, subSize, false)
            // Disegna Apice (nella stessa X di partenza del pedice!)
            processText(nextX, startY - supOffset, supGroup.content, subSize, false)
        }
        
        // Il cursore avanza della larghezza massima tra i due + un po' di margine
        cursorX = nextX + Math.max(subW, supW)
        i = nextIndex + consumedLength // Saltiamo tutto il blocco _...^...
    } else {
        // Se c'è solo uno dei due o nessuno, proseguiamo normalmente
        // Il ciclo while al prossimo giro beccherà il singolo ^ o _
        cursorX = nextX
        i = nextIndex
    }
  }
  
  return cursorX - startX
}

export function drawCenteredFormula(y, rawText, baseSize, screenWidth) {
  const totalWidth = processText(0, 0, rawText, baseSize, true)
  const startX = (screenWidth - totalWidth) / 2
  processText(startX, y, rawText, baseSize, false)
}