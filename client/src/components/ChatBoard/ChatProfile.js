import React from 'react'

export default function Chatboard({info}) {
  return (
    <div className="contact-profile">
      <img src={`data:image/png;base64,${info.avatar}`} alt="" />
      <p className="profileName">{info.name}</p>
      <div className="social-media" />
    </div>
  )
}