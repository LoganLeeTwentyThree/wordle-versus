import { useState } from 'react'
import Game from './Game';

import './App.css'

function App() {

  const [lobby, setLobby] = useState<string>("")
  const [submitted, setSubmitted] = useState<boolean>(false)
 
  return (
  <div>
    {!submitted && 
    <div>
      <div>Join a lobby</div>
      <input type='text' placeholder='lobby' onChange={(e) => {setLobby(e.target.value)}}></input>
      <button onClick={() => setSubmitted(true)}>Join</button>
    </div>}
    {submitted && <Game lobby={lobby}/>}
  </div>)
  

  

  
}

export default App
