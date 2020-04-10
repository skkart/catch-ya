import axios from 'axios'
import userService from '../services/user-service'


export const getAuthToken = () => {
  return localStorage.getItem('access_token')
}

export const setAuthToken = (token) => {
  return localStorage.setItem('access_token', token)
}

export const removeAuthToken = () => {
  localStorage.removeItem('access_token')
}

export const getGroupName = (g1, g2) => {
  return ([g1, g2].sort().join('_'))
}

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  },
)


axios.interceptors.response.use(response => response,
  (error) => {
    if (error.response.status === 401) {
      userService.logout()
    }

    // return Error object with Promise
    return Promise.reject(error)
  })
