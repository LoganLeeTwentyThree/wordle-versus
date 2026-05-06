import useWebSocketModule from "react-use-websocket";

//react-use-websocket broken as of vite 8 -> https://github.com/robtaussig/react-use-websocket/issues/280#issuecomment-4352423364 
const { default: useWebSocket = useWebSocketModule } = useWebSocketModule as unknown as {
    default: typeof useWebSocketModule;
};

function Queue( props: { type: number, onMatchFound : (id: string) => void})
{
    const { lastJsonMessage } = useWebSocket("matchmaker?type=" + props.type)
    console.log(lastJsonMessage)

    if(lastJsonMessage?.command && lastJsonMessage.command === "Match")
    {
        props.onMatchFound(lastJsonMessage.lobby)
    }
    
    return (
        <div>
            {!(lastJsonMessage?.command) && <div>Searching for a match...</div>}
            {lastJsonMessage?.command == "Match" && <div>Match found! Connecting...</div>}
        </div>
    )
}

export default Queue