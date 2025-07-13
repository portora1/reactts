import React, {useState, useEffect} from "react";

type CounterProps = {
    initialCount: number;
    onCountChange: (newCount: number) =>void;
};

export const Counter: React.FC<CounterProps> = ({ initialCount, onCountChange }) => {
    const [count, setCount] = useState<number>(initialCount);
    //カウントが変更されるたびにコールバックを呼ぶ
    useEffect(() => {
        onCountChange(count);
    },[count, onCountChange]);

    const handleIncrement = () => {
        setCount(prev => prev +1);
    };
    const handleDecrement = () => {
        setCount(prev => prev -1);
    };

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={handleDecrement}>-</button>
            <button onClick={handleIncrement}>+</button>
        </div>
    );
};