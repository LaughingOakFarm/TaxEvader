import * as WebSocket from 'ws';
import { startWebSocketServer, PORT } from './server';

describe('WebSocket server', () => {
    let server: WebSocket.Server;

    beforeAll(() => {
        server = startWebSocketServer();
    });

    afterAll(() => {
        server.close();
    });

    it('should receive sensor data', (done) => {
        const ws = new WebSocket(`ws://localhost:${PORT}`);

        ws.on('open', () => {
            console.log('Connected to WebSocket server');
        });

        ws.on('message', (message: WebSocket.Data) => {
            try {
                const sensorData = JSON.parse(message.toString());
                // Check the shape of the received data
                expect(sensorData).toHaveProperty('temperature');
                expect(sensorData.temperature).toBeDefined();
                ws.close();
                done();
            } catch (error) {
                done(error);
            }
        });

        ws.on('error', (error) => {
            done(error);
        });
    });
});
