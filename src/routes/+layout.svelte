<script>
	import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
	import "../app.css";
	import { browser } from "$app/environment";
	import { Toaster } from "$lib/shadcn/components/ui/sonner";
	import { islite } from "$lib/is-lite";
	import Playground from "./Playground.svelte";
</script>

{#if islite()}
	<Playground />
{:else}
	<QueryClientProvider
		client={new QueryClient({
			defaultOptions: {
				queries: {
					enabled: browser,
				},
			},
		})}>
		<slot></slot>
	</QueryClientProvider>
{/if}

<Toaster />

<style></style>
