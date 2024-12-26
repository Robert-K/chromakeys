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
	<main>
		<Sidebar.Trigger />
		{@render children?.()}
	</main>
</Sidebar.Provider>
