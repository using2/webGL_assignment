import React from 'react'
import {BrowserRouter as Routes, Route} from 'react-router-dom'
import Chat from './components/chat/chat'
import Join from './components/join/join'

const App = () => {
  return (
    <Routes>
      <Route path='/' exact component={Join} />
      <Route path='/chat' component={Chat} />
    </Routes>
  )
}

export default App