import { connect, createStore, withLogger } from 'undux'

let store = createStore({
  selections: [],
  sortOption: 'total-desc',
})

if (!process.env.IS_PRODUCTION) {
  store = withLogger(store)
}

export let withStore = connect(store)
