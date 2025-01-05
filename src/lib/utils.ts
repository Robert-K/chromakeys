import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function noteToLabel(note: number, showOctave = true) {
	if (note < 0 || note > 127) return ''
	const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
	return notes[note % 12] + (showOctave ? Math.floor(note / 12) - 1 : '')
}