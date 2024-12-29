<script lang="ts">
	import { ModeWatcher } from 'mode-watcher'
	import * as Sidebar from '$lib/components/ui/sidebar/index.js'
	import AppSidebar from '$lib/components/app-sidebar.svelte'
	import ThemeToggle from '$lib/components/theme-toggle.svelte'
	import '../app.css'
	let { children } = $props()
</script>

<ModeWatcher />
<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full min-w-0">
		<Sidebar.Trigger class="absolute m-2" />
		<ThemeToggle className="absolute m-2 right-0" />
		<div class="w-full overflow-hidden">
			{@render children?.()}
		</div>
	</main>
</Sidebar.Provider>
