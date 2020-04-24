import axios from 'axios'
import { CHAT_LIST_ERROR, CHAT_LIST_SUCCESS, CURRENT_CHAT } from './types'
import { getGroupName } from '../utils/auth-helper'


export const loadUserChats = () => async (dispatch, getState) => {
  try {
    const { auth } = getState()
    window.stt = getState
    const resp = await axios('/users/connections')
    const newChats = resp.data.map(({
      name, about, avatar, _id, email, status, members
    }) => {
      const isGroup = !email
      return {
        avatar,
        name,
        about,
        _id,
        status,
        unreadCount: 0,
        isGroup,
        participants: members && members.length,
        room: isGroup ? _id : getGroupName(_id, auth._id)
      } 
    })
    dispatch({ type: CHAT_LIST_SUCCESS, payload: newChats })
  } catch (e) {
    dispatch({ type: CHAT_LIST_ERROR, payload: [] })
  }
}

export const updateUserChats = (newChatList) => (dispatch, getState) => {
  try {
    dispatch({ type: CHAT_LIST_SUCCESS, payload: newChatList })
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

export const setCurrentChatProfile = (currentChat) => (dispatch, getState) => {
  try {
    dispatch({ type: CURRENT_CHAT, payload: currentChat })
  } catch (e) {
    dispatch({ type: CURRENT_CHAT, payload: {} })
  }
}