declare module "jsmidgen" {
  export class File {
    addTrack(track?: Track): Track;
    toBytes(): string;
  }

  export class Track {
    setTempo(bpm: number, time?: number): Track;
    addNote(
      channel: number,
      pitch: number | string,
      duration: number,
      time?: number,
      velocity?: number
    ): Track;
    addNoteOn(
      channel: number,
      pitch: number | string,
      time?: number,
      velocity?: number
    ): Track;
    addNoteOff(
      channel: number,
      pitch: number | string,
      time?: number,
      velocity?: number
    ): Track;
  }

  export class Event {
    // MIDI event
  }

  export namespace Util {
    function midiPitchFromNote(note: string): number;
    function ensureMidiPitch(pitch: number | string): number;
    function noteFromMidiPitch(pitch: number, returnFlat?: boolean): string;
  }
}
