import axios from 'axios'
import { CHAT_LIST_ERROR, CHAT_LIST_SUCCESS } from './types'
import { getGroupName } from '../utils/auth-helper'


export const loadUserChats = () => async (dispatch, getState) => {
  try {
    window.myState = getState
    const { auth } = getState()
    const resp = await axios('/users/connections')
    const newChats = resp.data.map(({
      name, about, avatar, _id, email
    }) => {
      const isGroup = !email
      return {
        photo: avatar,
        name,
        text: about,
        id: _id,
        isGroup,
        room: isGroup ? _id : getGroupName(_id, auth._id)
      } 
    })
    dispatch({ type: CHAT_LIST_SUCCESS, payload: newChats })
  } catch (e) {
    dispatch({ type: CHAT_LIST_ERROR, payload: [] })
  }
}

export const resetUserChats = () => (dispatch, getState) => {
  try {
    console.log('Reset')
    dispatch({ type: CHAT_LIST_SUCCESS, payload: [] })
  } catch (e) {
    dispatch({ type: CHAT_LIST_ERROR, payload: [] })
  }
}