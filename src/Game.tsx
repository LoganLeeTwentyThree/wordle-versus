import { useRef } from "react";
import useWebSocketModule, { ReadyState } from "react-use-websocket";

//react-use-websocket broken as of vite 8 -> https://github.com/robtaussig/react-use-websocket/issues/280#issuecomment-4352423364 
const { default: useWebSocket = useWebSocketModule } = useWebSocketModule as unknown as {
    default: typeof useWebSocketModule;
};
import './App.css'
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

type Guess = {
  word: string,
  correctness: number[]
}

function Game(props: {lobby: string}) {
    const {
        sendJsonMessage,
        lastJsonMessage,
        readyState
    } = useWebSocket("/websocket?lobby=" + props.lobby)

    const guessField = useRef<HTMLInputElement>(null)
    const guesses = useRef<Guess[]>([])
    const activePlayerId = useRef<string>("")
    const winnerId = useRef<string>("")
    const myId = useRef<string>("")

    if(readyState == ReadyState.CLOSED)
    {
        //opponent left
        window.location.reload()
    }

    if(lastJsonMessage?.message?.state != undefined)
    {
        const newState = lastJsonMessage.message.state
        guesses.current = newState.guesses
        activePlayerId.current = newState.activePlayerId
        winnerId.current = newState.winnerId
        myId.current = lastJsonMessage.playerId
    }

    if(lastJsonMessage?.message?.error)
    {
        toast.error(lastJsonMessage?.message?.error, {
            position: "top-right",
            autoClose: 2000,
            theme: "dark"
        });
    }
    

    function guess(word : string | undefined)
    {
        if(word)
        {
            sendJsonMessage({type: "GUESS", payload: { guess: word }})
        }
    }

    function renderBoard()
    {
        return (
        guesses.current.map((e : Guess) =>
            <div key={e.word} className="wvs-board-row">
                {[...e.word].map((l, i) => {
                    const colorClass = e.correctness[i] == 0 ? "t-d" : (e.correctness[i] == 1 ? "t-g" : "t-y")
                    return <div className={`wvs-tile ${colorClass}`} key={e + l + i}>{l}</div>
                })}
            </div>
        ))
    }

    return (
        <div className="wvs-root">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="wvs-subtitle">Connected to {props.lobby}</div>

            {activePlayerId.current !== "" && winnerId.current === "" &&
            <div className="wvs-panel">
                <div className={`wvs-turn-banner ${activePlayerId.current === myId.current ? "wvs-turn-mine" : "wvs-turn-opponent"}`}>
                    {activePlayerId.current === myId.current ? "Your Turn" : "Opponent's Turn"}
                </div>

                <div className="wvs-board">
                    {renderBoard()}
                </div>

                <div className="wvs-block">
                    <input type="text" ref={guessField} placeholder="Enter guess" className="wvs-input" />
                    <button onClick={() => guess(guessField?.current?.value)} className="wvs-btn wvs-btn-join">
                        Guess →
                    </button>
                </div>
            </div>}

            {winnerId.current !== "" &&
            <div className="wvs-panel">
                <div className={`wvs-result-banner ${winnerId.current === myId.current ? "wvs-result-win" : "wvs-result-lose"}`}>
                    {winnerId.current === myId.current ? "You Won! 🎉" : "You Lost..."}
                </div>

                <div className="wvs-board">
                    {renderBoard()}
                </div>

                <div className="wvs-block">
                    <button onClick={() => window.location.reload()} className="wvs-btn wvs-btn-search">
                        Leave
                    </button>
                </div>
            </div>}
        </div>
    )
}



export default Game
