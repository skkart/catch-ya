import axios from 'axios'
import { setAuthToken, removeAuthToken } from '../utils/auth-helper'

// remove user from local storage to log user out
async function logout() {
  try {
    await axios.post('/auth/logout')
  } catch (e) {
    console.log('Failed to logout')
  } finally {
    removeAuthToken()
  }
}


async function login(email, password) {
  const resp = await axios.post('/auth/login', {
    email,
    password,
  })

  // store user details and jwt token in local storage to keep user logged in between page refreshes
  resp.data.token && setAuthToken(resp.data.token)
  console.log('login', resp.data.user)
  return resp.data.user
}

// register user request
async function register (user) {
  const resp = await axios('/auth/register', user)
  return resp.data.user
}


export default {
  login,
  logout,
  register,
}
