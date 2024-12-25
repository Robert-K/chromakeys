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

	let outputs = $state<Output[]>([])

	WebMidi.enable()
		.then(() => {
			outputs = WebMidi.outputs
		})
		.catch((error) => {
			console.log('WebMidi could not be enabled', error)
		})

	let synth: Tone.Synth

	let selectedId = $state('')
	let selectedOutput = $derived(WebMidi.enabled ? WebMidi.getOutputById(selectedId) : null)

	interface Key {
		label: string
		code: string
	}

	let mapping = $state(false)
	let layout = $state<Key[]>([])

	let rowCount = $state(4)
	let rootNote = $state(60)

	interface HeldNote {
		code: string
		note: number
	}

	let heldNotes = $state<HeldNote[]>([])

	const directionIcons = [MoveUpRight, MoveDownRight, MoveDownLeft, MoveUpLeft]
	let rowDirection = $state(0)
	const DirectionIcon = $derived(directionIcons[rowDirection])

	let stagger = $state(0.75)

	const indexToNote = (index: number) => {
		let note = rootNote + index
		note -= Math.floor(note / rowCount) * (rowCount - 3)
		return note
	}

	const noteLabel = (note: number) => {
		const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
		return notes[note % 12] + Math.floor(note / 12)
	}

	const formatLabel = (label: string) => {
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
		if (event.repeat) return // Ignore repeats
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
		synth.triggerAttack(note)
	}

	const handleKeyUp = (event: KeyboardEvent) => {
		heldNotes
			.filter((held) => held.code === event.code)
			.forEach((held) => {
				selectedOutput?.stopNote(held.note)
				synth.triggerRelease(held.note)
			})
		heldNotes = heldNotes.filter((held) => held.code !== event.code)
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('keyup', handleKeyUp)

		synth = new Tone.Synth().toDestination()

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

	<Button onclick={() => (mapping = !mapping)}>{mapping ? 'Stop' : 'Map'}</Button>

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
</div>

{#each { length: rowCount }, rowIndex}
	<div class="flex" style="padding-left: {5 * (rowCount - rowIndex - 1) * stagger}rem;">
		{#each layout.filter((_, index) => index % rowCount === rowCount - rowIndex - 1) as key}
			<div
				class="border-2x m-2 flex h-20 w-20 flex-col items-center rounded-xl border-2"
				class:bg-muted={heldNotes.some((note) => note.code === key.code)}
			>
				<div>{noteLabel(indexToNote(layout.findIndex((other) => other.code === key.code)))}</div>
				<div>{formatLabel(key.label)}</div>
			</div>
		{/each}
	</div>
{/each}
