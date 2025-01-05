<script lang="ts">
	import Check from 'lucide-svelte/icons/check'
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
	import { tick } from 'svelte'
	import * as Command from '$lib/components/ui/command/index.js'
	import * as Popover from '$lib/components/ui/popover/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { cn, noteToLabel } from '$lib/utils.js'
	import type { Scale } from '$lib/scales'

	let {
		from = 0,
		to = 11,
		note = $bindable(),
		showOctave = true,
		id,
	}: { from?: number, to?: number, note: number; showOctave?: boolean; id: string } = $props()

	let options = $derived(
		Array.from({ length: to - from + 1 }, (_, index) => ({
			label: noteToLabel(index + from, showOctave),
			value: index + from,
		})),
	)

	let open = $state(false)
	let triggerRef = $state<HTMLButtonElement>(null!)

	const selectedValue = $derived(noteToLabel(note, showOctave))

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false
		tick().then(() => {
			triggerRef.focus()
		})
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props }: { props: any })}
			<Button
				variant="outline"
				class="w-full justify-between"
				{...props}
				role="combobox"
				aria-expanded={open}
			>
				{selectedValue || 'Select a note...'}
				<ChevronsUpDown class="opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-full p-0">
		<Command.Root>
			<Command.Input placeholder="Search notes..." />
			<Command.List>
				<Command.Empty>No notes found.</Command.Empty>
				<Command.Group>
					{#each options as option}
						<Command.Item
							value={option.label}
							onSelect={() => {
								note = option.value
								closeAndFocusTrigger()
							}}
						>
							<Check class={cn(note !== option.value && 'text-transparent')} />
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
