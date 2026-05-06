import { useState } from 'react'
import Game from './Game';

import './App.css'
import Queue from './Queue';

function App() {

  const [lobby, setLobby] = useState<string>("")
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [searching, setSearching] = useState<boolean>(false)
 
  return (
  <>
  {!submitted &&
    <div className="wvs-root">
      <div className="wvs-wordmark" aria-label="WordleVS logo tiles">
        <div className="wvs-tile t-g">W</div>
        <div className="wvs-tile t-d">O</div>
        <div className="wvs-tile t-y">R</div>
        <div className="wvs-tile t-g">D</div>
        <div className="wvs-tile t-d">L</div>
        <div className="wvs-tile t-y">E</div>
        <div className="wvs-tile t-d">V</div>
        <div className="wvs-tile t-g">S</div>
      </div>
      <p className="wvs-subtitle">Multiplayer word battles</p>
      <div className="wvs-panel">
        <div className="wvs-block">
          <div className="wvs-block-label">Join a lobby</div>
          <input className="wvs-input" type="text" placeholder="Enter lobby code" onChange={(e) => setLobby(e.target.value)} />
          <button className="wvs-btn wvs-btn-join" onClick={() => setSubmitted(true)}>Join →</button>
        </div>
        <div className="wvs-or"><span>or</span></div>
        <div className="wvs-block">
          <div className="wvs-block-label">Search for a match</div>
          <button className="wvs-btn wvs-btn-search" onClick={() => setSearching(true)}>Find a match →</button>
        </div>
      </div>
    </div>
  }
  {searching && <Queue type={0} onMatchFound={(url) => { setLobby(url); setSubmitted(true); setSearching(false); }} />}
  {submitted && <Game lobby={lobby} />}
</>)
  

  

  
}

export default App
