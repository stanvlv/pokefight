import React from 'react'
import { Outlet } from 'react-router-dom'

export default function MainView() {
  return (
    <div>
      <>
        I am a navigation bar
        <a href='/'>Home</a>
        <a href='/pokemon'>Pokemon</a>
        <a href='/fight'>Fight</a>
    </>
        <Outlet />
    </div>
  )
}
