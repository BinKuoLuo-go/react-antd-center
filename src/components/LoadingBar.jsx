import LoadingBar from 'react-top-loading-bar'
import { loadingBarRef } from '../utils/loadingBar.js'

const TopLoadingBar = () => (
  <LoadingBar ref={loadingBarRef} color="#1677ff" height={3} shadow />
)

export default TopLoadingBar
