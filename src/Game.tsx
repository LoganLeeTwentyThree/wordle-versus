import { useRef } from "react";
import useWebSocketModule from "react-use-websocket";

//react-use-websocket broken as of vite 8 -> https://github.com/robtaussig/react-use-websocket/issues/280#issuecomment-4352423364 
const { default: useWebSocket = useWebSocketModule } = useWebSocketModule as unknown as {
    default: typeof useWebSocketModule;
};
import './App.css'

type Guess = {
  word: string,
  correctness: number[]
}

function Game(props: {lobby: string}) {
    const {
        sendJsonMessage,
        lastJsonMessage,
    } = useWebSocket("/websocket?lobby=" + props.lobby)

    const guessField = useRef<HTMLInputElement>(null)
    const guesses = useRef<Guess[]>([])
    const activePlayerId = useRef<string>("")
    const winnerId = useRef<string>("")
    const myId = useRef<string>("")

    console.log(lastJsonMessage)
    if(lastJsonMessage?.message?.state != undefined)
    {
        const newState = lastJsonMessage.message.state
        guesses.current = newState.guesses
        activePlayerId.current = newState.activePlayerId
        winnerId.current = newState.winnerId
        myId.current = lastJsonMessage.playerId
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
            <div style={{ 
                flexDirection: "row", 
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}> 
                {[...e.word].map((l, i) => {
                    const color = e.correctness[i] == 0 ? "grey" : (e.correctness[i] == 1 ? "green" : "yellow")
                    return <div style={
                        {
                            backgroundColor: color,
                            width: 30,
                            height: 30,
                            margin: 2,
                            color: "black"
                        }
                    }
                    key={e + l + i}>
                    {l}</div>
                })}
            </div>
                
        ))
    }

    return <div>
        <div>Connected to {props.lobby}</div>
        {activePlayerId.current !== "" && winnerId.current === "" &&
        <div>
            <div>{activePlayerId.current === myId.current ? "Your Turn" : "Opponent's Turn"}</div>
            
            {renderBoard()}
            
            <input type="text" ref={guessField} placeholder="Guess"></input>
            <button onClick={() => guess(guessField?.current?.value)}>Guess</button>
        </div>}
        {winnerId.current !== "" && 
        <div>
            {renderBoard()}
            <div>You {winnerId.current === myId.current ? "Won!" : "Lost..."}</div>
            <button onClick={() => window.location.reload()}>Leave</button>
        </div>
        }
    </div>
}



export default Game
