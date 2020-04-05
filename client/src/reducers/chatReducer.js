import {
  CHAT_LIST_SUCCESS
} from '../actions/types'

export default function (state = {}, action) {
  console.log('action chatReducer', action)
  switch (action.type) {
  case CHAT_LIST_SUCCESS:
    return {
      list: action.payload
    }
  default:
    return state
  }
}
