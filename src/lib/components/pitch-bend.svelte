<script lang="ts">
	let { pitchBend = $bindable(0) } = $props()

	let pitchBendRange = $state(1)

	let returnSpeed = $state(20)

	let dragging = false

	function handleDragStart() {
		dragging = true
	}

	function handleDragEnd() {
		dragging = false
		slideCenter()
	}

	function slideCenter(lastTime: number = performance.now()) {
		if (!dragging && pitchBend !== 0) {
			const currentTime = performance.now()
			const deltaTime = (currentTime - lastTime) / 1000 // convert to seconds
			const step = returnSpeed * deltaTime

			if (pitchBend > 0) {
				pitchBend = Math.max(0, pitchBend - step)
			} else {
				pitchBend = Math.min(0, pitchBend + step)
			}

			requestAnimationFrame(() => slideCenter(currentTime))
		}
	}
</script>

<input
	type="range"
	bind:value={pitchBend}
	min={-pitchBendRange}
	max={pitchBendRange}
	step={1 / 16383}
	class="absolute left-4 pitch-bend"
	onmousedown={handleDragStart}
	onmouseup={handleDragEnd}
	ontouchstart={handleDragStart}
	ontouchend={handleDragEnd}
/>
