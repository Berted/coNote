import { StateEffect } from "@codemirror/state";

export const addCursor = StateEffect.define<{
  uid: string;
  name: string;
  color: string;
  from: number;
  to: number;
}>();

export const remCursor = StateEffect.define<{
  uid: string;
  from: number;
  to: number;
}>();
