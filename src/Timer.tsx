import { useTimer } from 'react-timer-hook'

export default function Timer( props: { expiryTimeStamp : Date, onExpire : () => void} )
{
    const { seconds } = useTimer({
        expiryTimestamp: props.expiryTimeStamp,
        onExpire: props.onExpire,
    })

    return (
        <div>
            {seconds}
        </div>
    )
}