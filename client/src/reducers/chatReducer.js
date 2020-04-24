import {
  CHAT_LIST_SUCCESS,
  CURRENT_CHAT
} from '../actions/types'

export default function (state = {}, action) {
  switch (action.type) {
  case CHAT_LIST_SUCCESS:
    return {
      ...state,
      list: action.payload,
    }
  case CURRENT_CHAT:
    return {
      ...state,
      current: action.payload,
    }
  default:
    return state
  }
}
