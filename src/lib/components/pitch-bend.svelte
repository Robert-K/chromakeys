<script lang="ts">
	import { onMount } from "svelte"

	let { pitchBend = $bindable(0), onchange }: { pitchBend: number, onchange: (value: number) => void } = $props()

	let targetValue = $state(0)

	let pitchBendRange = $state(1)

	let speed = $state(20)

	let dragging = false

    let animationFrame = 0

	function handleDragStart() {
		dragging = true
	}

	async function handleDragEnd() {
		dragging = false
        setTimeout(() => {
            targetValue = 0
        }, 0)
	}

	function slideToTarget(lastTime: number = performance.now()) {
		const currentTime = performance.now()
		if (pitchBend !== targetValue || dragging) {
			const deltaTime = currentTime - lastTime
			const direction = Math.sign(targetValue - pitchBend)
            const prevPitchBend = pitchBend

			pitchBend += direction * speed * deltaTime / 1000

            if (direction > 0 && pitchBend > targetValue) {
                pitchBend = targetValue
            } else if (direction < 0 && pitchBend < targetValue) {
                pitchBend = targetValue
            }

            if (prevPitchBend !== pitchBend) {
                onchange(pitchBend)
            }
		}
		animationFrame = requestAnimationFrame(() => slideToTarget(currentTime))
	}

    onMount(() => {
        slideToTarget()

        return () => {
            cancelAnimationFrame(animationFrame)
        }
    })
</script>

<div class="absolute left-4">
	<input
		type="range"
		value={pitchBend}
		min={-pitchBendRange}
		max={pitchBendRange}
		step={1 / 16383}
		disabled
		class="pitch-bend relative"
	/>
	<input
		type="range"
        bind:value={targetValue}
        min={-pitchBendRange}
		max={pitchBendRange}
		step={1 / 16383}
		onmousedown={handleDragStart}
		onmouseup={handleDragEnd}
		ontouchstart={handleDragStart}
		ontouchend={handleDragEnd}
		class="pitch-bend-input absolute left-0"
	/>
</div>
