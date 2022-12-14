export interface IMUData {
  thermometer: {
    celsius: number;
    fahrenheit: number;
    kelvin: number;
  };

  accelerometer: {
    x: number;
    y: number;
    z: number;
    acceleration: number;
    inclination: number;
    orientation: number;
    pitch: number;
    roll: number;
  };

  gyro: {
    x: number;
    y: number;
    z: number;
    isCalibrated: boolean;
    pitch: {
      rate: number;
      angle: number;
    };
    rate: {
      x: number;
      y: number;
      z: number;
    };
    roll: {
      rate: number;
      angle: number;
    };
    yaw: {
      rate: number;
      angle: number;
    };
  };
}
