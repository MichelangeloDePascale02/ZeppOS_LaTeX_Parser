
import { getPackageInfo } from '@zos/app'

App({
  globalData: {
  },
  onCreate(options) {

    const { appId } = getPackageInfo()
    
  },

  onDestroy(options) {
  }
})