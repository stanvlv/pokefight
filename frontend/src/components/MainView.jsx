import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function MainView() {
  return (
    <div>
      <>
        I am a navigation bar
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/pokemon'>Pokemon</NavLink>
        <NavLink to='/fight'>Fight</NavLink>
      </>
        <Outlet />
    </div>
  )
}
