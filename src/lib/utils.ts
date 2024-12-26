import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatKeyLabel(label: string) {
	switch (label) {
		case 'ArrowUp':
			return '↑'
		case 'ArrowDown':
			return '↓'
		case 'ArrowLeft':
			return '←'
		case 'ArrowRight':
			return '→'
		case 'Space':
			return '␣'
		case 'Enter':
			return '↵'
		case 'Backspace':
			return '⌫'
		case 'Tab':
			return '⇥'
		case 'ShiftLeft':
		case 'ShiftRight':
			return '⇧'
		case 'Dead':
			return '´'
		default:
			return label.replace('´', '').toUpperCase()
	}
}

export function noteToLabel(note: number) {
	if (note < 0 || note > 127) return ''
	const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
	return notes[note % 12] + Math.floor(note / 12)
}