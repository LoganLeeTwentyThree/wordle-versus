import { GameRoom } from "@loganlee23/gameroom"
import type { Player, Action, Result } from "@loganlee23/gameroom"
export { Matchmaker } from "@loganlee23/gameroom"

type Guess = {
    word: string,
    correctness: number[]
}

export type State = {
    activePlayerId: string,
    guesses: Guess[],
    winnerId: string,
    nextTimeMs: number
    secrets: { word: string }
}

// Define all actions and their payload shapes here.
type WordleActions = {
    GUESS: { guess: string }
    NOTIFY: {}
}

export class WordleVs extends GameRoom<State, WordleActions, {}, Env>
{
    getInitialState(): State {
        return {
            nextTimeMs: 0,
            activePlayerId: "",
            guesses: [],
            winnerId: "",
            secrets: { word: "" }
        }
    }

    getConfig() {
        return {}
    }

    validatePlayerTryJoin(): Result {
        if (this.getActivePlayers().length < 2) return { success: true }
        return { success: false, reason: "Room is full!" }
    }

    async onPlayerJoin(player: Player): Promise<void> {
        if (this.getActivePlayers().length === 2) {

            const response = await fetch('https://random-words-api.kushcreates.com/api?length=5&words=1')
            const word = await response.json() as [{ word: string }]
            console.log(word[0].word)
            this.currentGameState.UpdateState({
                secrets: { word: word[0].word },
                activePlayerId: player.id,
                nextTimeMs: Date.now() + 20 * 1000
            })
        }
    }

    onPlayerLeave(player: Player): void {
        console.log(player.name)
        this.closeRoom()
    }

    async validatePlayerAction(player: Player, action: Action<WordleActions>): Promise<Result> {
        if(action.type === "GUESS")
        {
            if(this.currentGameState.getField("winnerId") !== "")
            {
                return {success: false, reason: "Game is Over!"}
            }

            if (player.id !== this.currentGameState.getField("activePlayerId")) {
                return { success: false, reason: "Not your turn!" }
            }

            if (Date.now() > this.currentGameState.getField("nextTimeMs"))
            {
                return { success: false, reason: "Out of time!" }
            }

            if (action.type === "GUESS") {
                if (action.payload.guess.length !== 5) {
                    return { success: false, reason: "Word must be 5 letters!" }
                }

                //check if word is real
                const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + action.payload.guess)
                if(response.ok == false)
                {
                    return {success: false, reason: action.payload.guess + " is not a real word!"}
                } 
            }  
        }


        return { success: true }
    }

    onValidPlayerAction(player: Player, action: Action<WordleActions>): void {
        if (action.type === "GUESS") {
            const word = this.currentGameState.getField("secrets").word
            const guesses = [...this.currentGameState.getField("guesses"), { word: action.payload.guess.toUpperCase(), correctness: this.getCorrectness(action.payload.guess) }]

            if (action.payload.guess === word) {
                this.currentGameState.UpdateState({ guesses, winnerId: player.id })
            } else {
                const opponent = this.getActivePlayers().find(p => p.id !== player.id)
                this.currentGameState.UpdateState({
                    guesses,
                    activePlayerId: opponent?.id ?? "",
                    nextTimeMs: Date.now() + 20 * 1000
                })
            }
        }else if (action.type === "NOTIFY" && Date.now() > this.currentGameState.getField("nextTimeMs"))
        {
            console.log("Game over: timeout")
            const opponent = this.getActivePlayers().find(p => p.id !== this.currentGameState.getField("activePlayerId"))
            this.currentGameState.UpdateState({
                winnerId: opponent?.id ?? ""
            })
        }
    }

    private getCorrectness(word : string) : number[]
    {
        let result : number[] = new Array(5).fill(0)
        
        // 1 == correct == green
        // 2 == letter is in word == yellow

        const secret = this.currentGameState.getStateValues().secrets.word.toLowerCase()
        const secretMap = new Map<string, number>()
        

        for(let i = 0; i < 5; i++)
        {
            
            if(secret[i] == word[i].toLowerCase())
            {
                result[i] = 1
            }else
            {
                secretMap.set(secret[i], (secretMap.get(secret[i]) ?? 0) + 1)
            }
        }

        for(let i = 0; i < 5; i++)
        {
            if(secretMap.get(word[i])! > 0 && result[i] != 1)
            {
                result[i] = 2
                secretMap.set(word[i], secretMap.get(word[i])! - 1)
            }
        }

        

        return result
    }
}

export default {
    async fetch(request: Request, env: Env) {
        const url = new URL(request.url)

        if (url.pathname === "/matchmaker") {
            const id = env.MATCHMAKER.idFromName("global")
            return env.MATCHMAKER.get(id).fetch(request)
        }

        if (url.pathname === "/websocket") {
            if (request.headers.get("Upgrade") !== "websocket") {
                return new Response("Expected WebSocket", { status: 426 })
            }
            const lobbyId = url.searchParams.get("lobby") ?? "default"
            const id = env.WORDLE_VS.idFromName(lobbyId)
            return env.WORDLE_VS.get(id).fetch(request)
        }

        return env.ASSETS.fetch(request)
    }
}