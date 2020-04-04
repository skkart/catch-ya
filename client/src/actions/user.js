import axios from 'axios'
import {
  LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, LOGOUT_FAILURE, SUCCESS, ERROR
} from './types'
import userService from '../services/user-service'
import { getAuthToken } from '../utils/auth-helper'


export const initUserAuth = () => async (dispatch) => {
  try {
    const token = getAuthToken()
    if (token) {
      // Using this token, get the user response
      const resp = await axios.get('/users/me')
      const payload = resp.data
      payload.isAuth = true
      dispatch({ type: SUCCESS, payload })
    } else {
      dispatch({
        type: ERROR,
        payload: {
          isAuth: false
        }
      })
    }
  } catch (e) {
    dispatch({
      type: ERROR,
      payload: {
        isAuth: false
      }
    })
  }
}

export const loginUser = ({ email, password }) => async (dispatch) => {
  try {
    const payload = await userService.login(email, password)
    payload.isAuth = true
    dispatch({ type: LOGIN_SUCCESS, payload })
  } catch (e) {
    dispatch({ type: LOGIN_FAILURE, payload: {} })
  }
}

export const logoutUser = () => async (dispatch) => {
  try {
    await userService.logout()
    dispatch({ type: LOGOUT })
  } catch (e) {
    dispatch({ type: LOGOUT_FAILURE })
  }
}

export default {
  loginUser,
}
