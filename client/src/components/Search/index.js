import React from 'react'
import './index.css'

export default function Search() {
  return (
    <div className="conversation-search">
      <input
        type="search"
        className="conversation-search-input"
        placeholder="Search Messages"
      />
    </div>
  )
}