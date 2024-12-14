<script>
	import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
	import "../app.css";
	import { browser } from "$app/environment";

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

<style></style>
