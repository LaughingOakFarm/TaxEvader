import { useEffect, useState } from 'react';

interface EventData {
  type: string;
  [key: string]: any;
}

function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [direction, setDirection] = useState<number>(1);
  const [stepDelay, setStepDelay] = useState<number>(1000);

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.1.9:8080');
    setWs(ws);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as EventData;
      setEvents((prevEvents) => {
        const newEvents = [...prevEvents, data];
        if (newEvents.length > 20) {
          newEvents.shift();
        }
        return newEvents;
      });
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

  const updateStepperDirection = () => {
    if (ws) {
      ws.send(
          JSON.stringify({ type: 'updateStepperDirection', direction: direction })
      );
    }
  };

  const updateStepperSpeed = () => {
    if (ws) {
      ws.send(
          JSON.stringify({ type: 'updateStepperSpeed', stepDelay: stepDelay })
      );
    }
  };

  return (
      <div>
        <h1>TaxEvader WebSocket Interface</h1>
        <div>
          <label>
            Direction:{' '}
            <select
                value={direction}
                onChange={(e) => setDirection(Number(e.target.value))}
            >
              <option value={1}>Clockwise</option>
              <option value={0}>Counterclockwise</option>
            </select>
          </label>
          <button onClick={updateStepperDirection}>Update Direction</button>
        </div>
        <div>
          <label>
            Step Delay:{' '}
            <input
                type="number"
                value={stepDelay}
                onChange={(e) => setStepDelay(Number(e.target.value))}
            />
          </label>
          <button onClick={updateStepperSpeed}>Update Speed</button>
        </div>
        <h2>Events</h2>
        <ul>
          {events.map((event, index) => (
              <li key={index}>{JSON.stringify(event)}</li>
          ))}
        </ul>
      </div>
  );
}

export default App;
