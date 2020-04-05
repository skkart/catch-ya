import {
  LOGIN_SUCCESS, LOGOUT, LOGOUT_FAILURE, SUCCESS, ERROR
} from '../actions/types'

export default function (state = {}, action) {
  console.log('action', action)
  switch (action.type) {
  case LOGIN_SUCCESS:
  case SUCCESS:
    return action.payload
  case LOGOUT:
  case LOGOUT_FAILURE:
  case ERROR:
    return {}
  default:
    return state
  }
}
