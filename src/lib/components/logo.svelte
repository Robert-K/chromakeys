<script lang="ts">
    import { paddedLogoArray as logo } from '$lib/logo'

    let {
        stagger = 0.75,
    } = $props()

    let keySize = $state(7)
    let gap = $state({x: 3, y: 3})
    let radius = $state(1)

    let height = $derived(logo.length * (keySize + gap.y) - gap.y)
    let width = $derived(Math.max(...logo.map(row => row.length)) * (keySize + gap.x) - gap.x + stagger * keySize * (logo.length - 1))
</script>

<svg {width} {height}>
    {#each logo as row, y}
        {#each row as key, x}
            <rect
                x={x * (keySize + gap.x) + (logo.length - 1 - y) * stagger * keySize}
                y={y * (keySize + gap.y)}
                width={keySize}
                height={keySize}
                rx={radius}
                ry={radius}
                class={key ? 'fill-current' : 'fill-muted'}
            />
        {/each}
    {/each}
</svg>
