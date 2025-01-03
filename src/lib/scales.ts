export interface Scale {
	name: string
	steps: number[]
}

export const scales: Scale[] = [
	{
		name: 'Chromatic',
		steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
	},
	{
		name: 'Major',
		steps: [0, 2, 4, 5, 7, 9, 11],
	},
	{
		name: 'Minor',
		steps: [0, 2, 3, 5, 7, 8, 10],
	},
	{
		name: 'Pentatonic',
		steps: [0, 2, 4, 7, 9],
	},
	{
		name: 'Blues',
		steps: [0, 3, 5, 6, 7, 10],
	},
	{
		name: 'Harmonic Minor',
		steps: [0, 2, 3, 5, 7, 8, 11],
	},
	{
		name: 'Melodic Minor',
		steps: [0, 2, 3, 5, 7, 9, 11],
	},
	{
		name: 'Dorian',
		steps: [0, 2, 3, 5, 7, 9, 10],
	},
	{
		name: 'Mixolydian',
		steps: [0, 2, 4, 5, 7, 9, 10],
	},
	{
		name: 'Lydian',
		steps: [0, 2, 4, 6, 7, 9, 11],
	},
	{
		name: 'Phrygian',
		steps: [0, 1, 3, 5, 7, 8, 10],
	},
	{
		name: 'Locrian',
		steps: [0, 1, 3, 5, 6, 8, 10],
	},
	{
		name: 'Whole Tone',
		steps: [0, 2, 4, 6, 8, 10],
	},
]