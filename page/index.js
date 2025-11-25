import { createWidget, widget, align } from '@zos/ui'
import { push } from '@zos/router'
import { getApp } from '@zos/app'

// Backup statico
import { MATH_DATA } from '../utils/data'


Page({
  state: {
    files: []
  },

  onInit() {
    console.log("PAGE: Init")

    // 1. Carica dati salvati (usando localStorage nativo)
    this.loadData()
  },

  loadData() {
    this.state.files = MATH_DATA
    console.log("Uso dati di default")
  },

  build() {
    const files = this.state.files || MATH_DATA

    // Titolo
    createWidget(widget.TEXT, {
      x: 0, y: 20, w: 466, h: 32,
      text: 'LaTeX Parser',
      color: 0xe94537, text_size: 28, align_h: align.CENTER_H
    })

    // Preparazione Lista
    const dataList = files.map((item) => {
      return {
        name: item.title || "???",
        formulas: item.formulas || [],
        title: item.title
      }
    })

    // Widget Lista
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
        // Recupero sicuro
        const source = (this.state.files && this.state.files[index]) ? this.state.files[index] : dataList[index];
        push({
          url: 'page/detail',
          params: { fileData: JSON.stringify({ title: source.title, formulas: source.formulas }) }
        })
      }
    })
  }
})