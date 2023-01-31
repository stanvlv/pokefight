import React from 'react'
import { Outlet } from 'react-router-dom'
import AppBarDown from './AppBarDown'
import AppBarUp from './AppBarUp'

export default function MainView() {
  return (
    <div>
      <>
        I am a navigation bar
        <a href='/'>Home</a>
        <a href='/pokemon'>Pokemon</a>
        <a href='/fight'>Fight</a>
    </>
        <AppBarUp />
        <Outlet />
        <AppBarDown />
    </div>
  )
}
