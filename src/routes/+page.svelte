<script lang="ts">
	import OutputSelect from '$lib/components/output-select.svelte'
	import ThemeToggle from '$lib/components/theme-toggle.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { onMount } from 'svelte'
	import { Output, WebMidi } from 'webmidi'
	import { MoveUpRight, MoveDownRight, MoveUpLeft, MoveDownLeft } from 'lucide-svelte'
	import Slider from '$lib/components/ui/slider/slider.svelte'
	import * as Tone from 'tone'
	import { mode } from 'mode-watcher'

	let outputs = $state<Output[]>([])

	WebMidi.enable()
		.then(() => {
			outputs = WebMidi.outputs
		})
		.catch((error) => {
			console.log('WebMidi could not be enabled', error)
		})

	let reverb: Tone.Reverb
	let piano: Tone.Sampler

	let selectedId = $state('')
	let selectedOutput = $derived(WebMidi.enabled ? WebMidi.getOutputById(selectedId) : null)

	interface Key {
		label: string
		code: string
	}

	let mapping = $state(false)
	let layout = $state<Key[]>([
		{
			label: '<',
			code: 'IntlBackslash',
		},
		{
			label: 'a',
			code: 'KeyA',
		},
		{
			label: 'w',
			code: 'KeyW',
		},
		{
			label: '3',
			code: 'Digit3',
		},
		{
			label: 'y',
			code: 'KeyZ',
		},
		{
			label: 's',
			code: 'KeyS',
		},
		{
			label: 'e',
			code: 'KeyE',
		},
		{
			label: '4',
			code: 'Digit4',
		},
		{
			label: 'x',
			code: 'KeyX',
		},
		{
			label: 'd',
			code: 'KeyD',
		},
		{
			label: 'r',
			code: 'KeyR',
		},
		{
			label: '5',
			code: 'Digit5',
		},
		{
			label: 'c',
			code: 'KeyC',
		},
		{
			label: 'f',
			code: 'KeyF',
		},
		{
			label: 't',
			code: 'KeyT',
		},
		{
			label: '6',
			code: 'Digit6',
		},
		{
			label: 'v',
			code: 'KeyV',
		},
		{
			label: 'g',
			code: 'KeyG',
		},
		{
			label: 'z',
			code: 'KeyY',
		},
		{
			label: '7',
			code: 'Digit7',
		},
		{
			label: 'b',
			code: 'KeyB',
		},
		{
			label: 'h',
			code: 'KeyH',
		},
		{
			label: 'u',
			code: 'KeyU',
		},
		{
			label: '8',
			code: 'Digit8',
		},
		{
			label: 'n',
			code: 'KeyN',
		},
		{
			label: 'j',
			code: 'KeyJ',
		},
		{
			label: 'i',
			code: 'KeyI',
		},
		{
			label: '9',
			code: 'Digit9',
		},
		{
			label: 'm',
			code: 'KeyM',
		},
		{
			label: 'k',
			code: 'KeyK',
		},
		{
			label: 'o',
			code: 'KeyO',
		},
		{
			label: '0',
			code: 'Digit0',
		},
		{
			label: ',',
			code: 'Comma',
		},
		{
			label: 'l',
			code: 'KeyL',
		},
		{
			label: 'p',
			code: 'KeyP',
		},
		{
			label: 'ß',
			code: 'Minus',
		},
		{
			label: '.',
			code: 'Period',
		},
		{
			label: 'ö',
			code: 'Semicolon',
		},
		{
			label: 'ü',
			code: 'BracketLeft',
		},
		{
			label: '´',
			code: 'Equal',
		},
		{
			label: '-',
			code: 'Slash',
		},
		{
			label: 'ä',
			code: 'Quote',
		},
		{
			label: '+',
			code: 'BracketRight',
		},
		{
			label: 'Backspace',
			code: 'Backspace',
		},
	])

	let rowCount = $state(4)
	let rootNote = $state(48) // C3

	let transpose = $state(0)

	interface HeldNote {
		code: string
		note: number
	}

	let heldNotes = $state<HeldNote[]>([])

	const directionIcons = [MoveUpRight, MoveDownRight, MoveDownLeft, MoveUpLeft]
	let rowDirection = $state(0)
	const DirectionIcon = $derived(directionIcons[rowDirection])

	let darkMode = $derived($mode === 'dark')

	let stagger = $state(0.75)

	const indexToNote = (index: number) => {
		let note = rootNote + index
		note -= Math.floor(note / rowCount) * (rowCount - 3) - rowCount + 1
		note += transpose
		return note
	}

	const noteToLabel = (note: number) => {
		if (note < 0 || note > 127) return ''
		const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
		return notes[note % 12] + Math.floor(note / 12)
	}

	const formatKeyLabel = (label: string) => {
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

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.target instanceof HTMLInputElement) return // Ignore input events
		if (event.repeat) return // Ignore repeats
		switch (event.code) {
			case 'ArrowUp':
				transpose += 1
				event.preventDefault()
				break
			case 'ArrowDown':
				transpose -= 1
				event.preventDefault()
				break
			case 'ArrowLeft':
				transpose -= 12
				event.preventDefault()
				break
			case 'ArrowRight':
				transpose += 12
				event.preventDefault()
				break
		}
		if (mapping) {
			if (!layout.some((key) => key.code === event.code)) {
				layout.push({ label: event.key, code: event.code })
			}
		}
		let index = layout.findIndex((key) => key.code === event.code)
		if (index === -1) return
		const note = indexToNote(index)
		selectedOutput?.playNote(note)
		heldNotes.push({ code: event.code, note: note })
		let label = noteToLabel(note)
		if (label !== '') piano.triggerAttack(label)
	}

	const handleKeyUp = (event: KeyboardEvent) => {
		heldNotes
			.filter((held) => held.code === event.code)
			.forEach((held) => {
				selectedOutput?.stopNote(held.note)
				let label = noteToLabel(held.note)
				if (label !== '') piano.triggerRelease(label)
			})
		heldNotes = heldNotes.filter((held) => held.code !== event.code)
	}

	const toggleMapping = () => {
		if (mapping) {
			console.log(layout)
		}
		mapping = !mapping
		if (mapping) {
			layout = []
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('keyup', handleKeyUp)

		reverb = new Tone.Reverb({ decay: 4, preDelay: 0, wet: 0.3 }).toDestination()
		piano = new Tone.Sampler({
			urls: {
				A0: 'A0.mp3',
				C1: 'C1.mp3',
				'D#1': 'Ds1.mp3',
				'F#1': 'Fs1.mp3',
				A1: 'A1.mp3',
				C2: 'C2.mp3',
				'D#2': 'Ds2.mp3',
				'F#2': 'Fs2.mp3',
				A2: 'A2.mp3',
				C3: 'C3.mp3',
				'D#3': 'Ds3.mp3',
				'F#3': 'Fs3.mp3',
				A3: 'A3.mp3',
				C4: 'C4.mp3',
				'D#4': 'Ds4.mp3',
				'F#4': 'Fs4.mp3',
				A4: 'A4.mp3',
				C5: 'C5.mp3',
				'D#5': 'Ds5.mp3',
				'F#5': 'Fs5.mp3',
				A5: 'A5.mp3',
				C6: 'C6.mp3',
				'D#6': 'Ds6.mp3',
				'F#6': 'Fs6.mp3',
				A6: 'A6.mp3',
				C7: 'C7.mp3',
				'D#7': 'Ds7.mp3',
				'F#7': 'Fs7.mp3',
				A7: 'A7.mp3',
				C8: 'C8.mp3',
			},
			release: 1,
			baseUrl: 'https://tonejs.github.io/audio/salamander/',
		}).connect(reverb)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('keyup', handleKeyUp)
		}
	})
</script>

<div class="flex w-64 flex-col gap-4 p-4">
	<OutputSelect bind:selectedId {outputs} />

	<Button onclick={() => selectedOutput?.playNote(60, { duration: 100 })}>Play Note</Button>

	Root
	<Input type="number" bind:value={rootNote} />

	Rows
	<Input type="number" bind:value={rowCount} />

	<Button onclick={toggleMapping}>{mapping ? 'Stop' : 'Map'}</Button>

	<Button onclick={() => (rowDirection = (rowDirection + 1) % 4)}>
		<DirectionIcon />
	</Button>

	<Slider
		value={[stagger]}
		onValueChange={(value) => (stagger = value[0])}
		min={0}
		max={1}
		step={0.05}
	/>

	<ThemeToggle />

	Transpose: {transpose > 0 ? '+' : ''}{transpose}
</div>

<div class="flex h-screen flex-col items-center justify-center">
	{#each { length: rowCount }, rowIndex}
		<div
			class="flex"
			style="padding-left: {5 * (rowCount - rowIndex - 1) * stagger}rem;
				   padding-right: {5 * rowIndex * stagger}rem;"
		>
			{#each layout.filter((_, index) => index % rowCount === rowCount - rowIndex - 1) as key}
				{@const pressed = heldNotes.some((note) => note.code === key.code)}
				{@const noteLabel = noteToLabel(
					indexToNote(layout.findIndex((other) => other.code === key.code)),
				)}
				{@const whiteKey = noteLabel && !noteLabel.includes('#')}
				<div
					class="border-2x m-2 flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2"
					class:border-primary={pressed}
					class:pt-2={pressed}
					class:bg-muted={whiteKey === darkMode}
				>
					<span class="text-xl font-semibold">{noteLabel}</span>
					<span class="text-muted-foreground">{formatKeyLabel(key.label)}</span>
				</div>
			{/each}
		</div>
	{/each}
</div>
