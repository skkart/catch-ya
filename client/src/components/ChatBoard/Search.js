import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { debounce } from 'lodash'

export default function Search(props) {
  const debounceSearch = debounce((text) => {
    props.onChatSearch(text)
  }, 250)
  return (
    <div className={props.className}>
      <label>
        <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
      </label>
      <input
        type="text"
        placeholder={props.placeholder || 'Search contacts & groups...'}
        onKeyUp={(e) => {
          debounceSearch(e.target.value)
        }}
      />
    </div>
  )
}