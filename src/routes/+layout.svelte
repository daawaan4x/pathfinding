<script>
	import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
	import "../app.css";
	import { browser } from "$app/environment";
	import { Toaster } from '$lib/shadcn/components/ui/sonner';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
			},
		},
	});
</script>

<QueryClientProvider client={queryClient}>
	<slot></slot>
</QueryClientProvider>

<Toaster/>

<style></style>
