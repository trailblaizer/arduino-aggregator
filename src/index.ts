import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { IMUData } from './imu-data';
import { loadMiddlewareConfig } from './load-config';
import { processArgs } from './process-args';
import { Status } from './status';
import { FaderData, KnobData } from './types';

console.log('\n----------------------------------');
console.log('. Welcome to Middleware Aggregator .');
console.log(`. Current Time is ${new Date().toLocaleString()} .`);
console.log('-----------------------------------\n');

const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const midi = require('midi');

const server = http.createServer(app);
const socketIoServer = new Server(server);

const args = processArgs();

const port = +args['port'];
const middlewaresConfigPath = args['middleware-config'];
const middlewareConfig = loadMiddlewareConfig(middlewaresConfigPath);

let status: Status = 'Not Started';

app.use(cors());
app.get('/status', (_: any, res: any) => res.send({ status }));
app.get('/middleware-config', (_: any, res: any) => res.send(middlewareConfig));
app.get('/data', (_: any, res: any) => res.send(data));

let data: {
  knobs: Record<string, KnobData>;
  faders: Record<string, FaderData>;
  imus: {
    leftHand?: IMUData;
    rightHand?: IMUData;
  };
} = {
  knobs: {},
  faders: {},
  imus: {
    leftHand: undefined,
    rightHand: undefined,
  },
};

export function startServer(port: number) {
  server.listen(port, () => {
    console.log(`App Server Started on *:${port}`);
  });

  status = 'Starting';
  middlewareConfig.middleware
    ? connectToMiddlewares(middlewareConfig.middleware)
    : false;
}

export function connectToMiddlewares(boards: Record<string, string>) {
  const leftHandMiddleware = io(boards['BOARD_UNO_1']); // This will be left hand.
  const rightHandMiddleware = io(boards['BOARD_UNO_2']); // This will be right hand.
  const knobsAndFadersMiddleware = io(boards['BOARD_MEGA_1']); // These are the knobs and faders.

  leftHandMiddleware.onAny((_, _data) => {
    console.log('Data', data);
    data.imus.leftHand = _data;
    socketIoServer.emit('data', data);
  });

  rightHandMiddleware.onAny((_, _data) => {
    data.imus.rightHand = _data;
    socketIoServer.emit('data', data);
  });

  knobsAndFadersMiddleware.onAny((_, _data) => {
    if (_data.type === 'knob') {
      data.knobs[_data.id] = _data;
    } else if (_data.type === 'fader') {
      data.faders[_data.id] = _data;
    }

    socketIoServer.emit('data', data);
  });

  status = 'Broadcasting';
  // performMidi();
}

status = 'Waiting';
startServer(port);

function performMidi() {
  const output = new midi.Output();
  output.openVirtualPort('Virtual Piano Player');

  setInterval(() => {
    if (data.imus.leftHand) {
      output.sendMessage([
        0x90,
        60 +
          (data.imus.leftHand.accelerometer.x +
            data.imus.leftHand.accelerometer.y +
            data.imus.leftHand.accelerometer.z),
        90,
      ]);

      setTimeout(() => {
        if (data.imus.leftHand) {
          output.sendMessage([
            0x80,
            60 +
              (data.imus.leftHand.accelerometer.x +
                data.imus.leftHand.accelerometer.y +
                data.imus.leftHand.accelerometer.z),
            0,
          ]);
        }
      }, 1000);
    }

    if (data.imus.rightHand) {
      output.sendMessage([
        0x90,
        60 -
          12 * 2 +
          (data.imus.rightHand.accelerometer.x +
            data.imus.rightHand.accelerometer.y +
            data.imus.rightHand.accelerometer.z),
        90,
      ]);

      setTimeout(() => {
        if (data.imus.rightHand) {
          output.sendMessage([
            0x80,
            60 -
              12 * 2 +
              (data.imus.rightHand.accelerometer.x +
                data.imus.rightHand.accelerometer.y +
                data.imus.rightHand.accelerometer.z),
            0,
          ]);
        }
      }, 250);
    }
  }, 250);
}
