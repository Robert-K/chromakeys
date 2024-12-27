<script lang="ts">
	import { ModeWatcher } from 'mode-watcher'
	import * as Sidebar from '$lib/components/ui/sidebar/index.js'
	import AppSidebar from '$lib/components/app-sidebar.svelte'
	import '../app.css'
	let { children } = $props()
</script>

<ModeWatcher />
<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full">
		<Sidebar.Trigger class="absolute m-2" />
		{@render children?.()}
	</main>
</Sidebar.Provider>
