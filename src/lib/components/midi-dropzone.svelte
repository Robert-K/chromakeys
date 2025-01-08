<script lang="ts">
	import Dropzone from 'svelte-file-dropzone'
	import * as tonejsMidi from '@tonejs/midi'
	import type { Midi } from '@tonejs/midi'
	const MidiInstance = tonejsMidi.Midi

	let { midi = $bindable(), onmidichange }: { midi?: Midi | null | undefined, onmidichange?: Function } = $props()

	function handleFiles(event: CustomEvent) {
		let acceptedFiles = event.detail.acceptedFiles as File[]
		if (acceptedFiles.length === 0) {
			return
		}
		acceptedFiles[0].arrayBuffer().then((buffer) => {
			midi = new MidiInstance(buffer)
			onmidichange?.(midi)
		})
	}
</script>

<Dropzone
	on:drop={handleFiles}
	accept={['audio/midi', 'audio/x-midi']}
	multiple={false}
	disableDefaultStyles
	containerClasses="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 text-base md:text-sm truncate"
>
	{#if midi}
		{midi.header.name}
	{:else}
		Drop a MIDI file here
	{/if}
</Dropzone>
