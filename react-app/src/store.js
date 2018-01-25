import { connect, createStore, withLogger } from 'undux'

let store = createStore({
  selections: [],
})

if (!process.env.IS_PRODUCTION) {
  store = withLogger(store)
}

export let withStore = connect(store)
