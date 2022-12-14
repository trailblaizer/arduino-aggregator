export interface ComponentData {
  id: string;
}

export interface KnobData extends ComponentData {
  direction: 'cw' | 'ccw';
  counter: number;
}

export interface FaderData extends ComponentData {
  value: number;
  min: number;
  max: number;
}
