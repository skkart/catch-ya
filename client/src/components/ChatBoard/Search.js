import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default function Chatboard() {
  return (
    <div className="search">
      <label>
        <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
      </label>
      <input type="text" placeholder="Search contacts & groups..." />
    </div>
  )
}