import * as WebSocket from 'ws';
import * as http from 'http';

interface SensorData {
    temperature: number;
}

function getSensorData(): SensorData {
    return {
        temperature: 0
    }
}

export const PORT = 8080;

export function startWebSocketServer(): http.Server {
    const server = http.createServer();
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('Client connected');

        // Listen for messages from the client
        ws.on('message', (message: WebSocket.Data) => {
            console.log(`Received message: ${message}`);
        });

        // Send data to the client
        setInterval(() => {
            const sensorData = getSensorData();
            ws.send(JSON.stringify(sensorData));
        }, 1000); // Adjust the interval as needed
    });

    server.listen(PORT, () => {
        console.log(`WebSocket server started on port ${PORT}`);
    });

    return server;
}
