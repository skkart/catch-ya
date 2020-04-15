import {
  LOGIN_SUCCESS, LOGOUT, LOGOUT_FAILURE, SUCCESS, ERROR, LOGIN_FAILURE
} from '../actions/types'

export default function (state = {}, action) {
  switch (action.type) {
  case LOGIN_SUCCESS:
  case SUCCESS:
  case LOGIN_FAILURE:
  case ERROR:
    // Object.assign(state, action.payload)
    // console.log('Before', state)
    // return state
    return { ...state, ...action.payload }
  case LOGOUT:
  case LOGOUT_FAILURE:
    return {}
  default:
    return state
  }
}
