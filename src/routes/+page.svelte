<script lang="ts">
	const ENABLE_AUDIO = false

	import OutputSelect from '$lib/components/output-select.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { onMount } from 'svelte'
	import { Output, WebMidi } from 'webmidi'
	import { MoveUpRight, MoveDownRight, MoveUpLeft, MoveDownLeft } from 'lucide-svelte'
	import Slider from '$lib/components/ui/slider/slider.svelte'
	import * as Tone from 'tone'
	import { mode } from 'mode-watcher'
	import { formatKeyLabel, noteToLabel } from '$lib/utils'
	import { QWERTZ } from '$lib/layouts'
	import Label from '$lib/components/ui/label/label.svelte'
	import { Portal } from 'bits-ui'
	import PitchBend from '$lib/components/pitch-bend.svelte'
	import Switch from '$lib/components/ui/switch/switch.svelte'

	let outputs = $state<Output[]>([])

	WebMidi.enable()
		.then(() => {
			outputs = WebMidi.outputs
			selectedId = outputs[0]?.id
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
	let layout = $state<Key[]>(QWERTZ)

	let rowCount = $state(4)
	let rootNote = $state(48) // C3

	let transpose = $state(0)

	let pitchBendRange = $state(2)

	let scale = $state(null) // TODO: Not implemented yet

	let enforceScale = $state(false)

	const handlePitchBend = (value: number) => {
		selectedOutput?.sendPitchBend(value)
	}
	interface HeldNote {
		code: string
		note: number
	}

	let heldNotes = $state<HeldNote[]>([])

	const directionIcons = [MoveUpRight, MoveDownRight, MoveDownLeft, MoveUpLeft]
	let rowDirection = $state(0) // TODO: This doesn't do anything yet
	const DirectionIcon = $derived(directionIcons[rowDirection])

	let darkMode = $derived($mode === 'dark')

	let stagger = $state(0.75)

	const indexToNote = (index: number) => {
		let note = rootNote + index
		note -= Math.floor(note / rowCount) * (rowCount - 3) - rowCount + 1
		note += transpose
		return note
	}

	const CC_SUSTAIN = 64

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.target instanceof HTMLInputElement) return // Ignore input events
		// const targetRole = (event.target as HTMLElement).getAttribute('role')
		// if (targetRole && ['combobox', 'slider'].includes(targetRole)) return
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
			case 'Space':
				selectedOutput?.sendControlChange(CC_SUSTAIN, 127)
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
		if (label !== '' && piano?.loaded) piano?.triggerAttack(label)
	}

	const handleKeyUp = (event: KeyboardEvent) => {
		switch (event.code) {
			case 'Space':
				selectedOutput?.sendControlChange(CC_SUSTAIN, 0)
				break
		}
		heldNotes
			.filter((held) => held.code === event.code)
			.forEach((held) => {
				selectedOutput?.stopNote(held.note)
				let label = noteToLabel(held.note)
				if (label !== '' && piano?.loaded) piano?.triggerRelease(label)
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

	const loadAudio = async () => {
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
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('keyup', handleKeyUp)

		if (ENABLE_AUDIO) loadAudio()

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('keyup', handleKeyUp)
		}
	})
</script>

<Portal to="#options">
	<div class="flex flex-col gap-4 p-4">
		<Label for="output">MIDI Output</Label>
		<OutputSelect bind:selectedId {outputs} id="output" />

		<Label for="pitchBendRange">Pitch Bend Range</Label>
		<Input type="number" bind:value={pitchBendRange} id="pitchBendRange" />

		<Label for="scale">Scale</Label>

		<div class="flex justify-between pr-1">
			<Label for="enforceScale">Enforce Scale</Label>
			<Switch bind:checked={enforceScale} id="enforceScale" />
		</div>

		<Label for="rootNote">Root Note</Label>
		<Input type="number" bind:value={rootNote} id="rootNote" />

		<Label for="rowCount">Number of Rows</Label>
		<Input type="number" bind:value={rowCount} id="rowCount" />

		<Button onclick={toggleMapping}>{mapping ? 'Finish Remapping' : 'Remap Keys'}</Button>

		<Label for="rowDirection">Row Direction</Label>
		<Button onclick={() => (rowDirection = (rowDirection + 1) % 4)} id="rowDirection">
			<DirectionIcon />
		</Button>

		<Label for="stagger">Row Stagger</Label>
		<Slider
			value={[stagger]}
			onValueChange={(value) => (stagger = value[0])}
			min={0}
			max={1}
			step={0.05}
			id="stagger"
		/>

		<Label for="transpose">Transpose</Label>
		<Input type="number" bind:value={transpose} id="transpose" />
	</div>
</Portal>

<div class="flex h-screen flex-col items-center justify-center">
	<PitchBend onchange={handlePitchBend} />
	{#each { length: rowCount }, rowIndex}
		<div
			class="flex"
			style="padding-left: {5 * (rowCount - rowIndex - 1) * stagger}rem;
				   padding-right: {5 * rowIndex * stagger}rem;"
		>
			{#each layout.filter((_, index) => index % rowCount === rowCount - rowIndex - 1) as key}
				<!-- TODO: Refactor keys and make them buttons + MPE -->
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
