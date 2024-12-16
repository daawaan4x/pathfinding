<script lang="ts">
	import { Button } from '$lib/shadcn/components/ui/button';
	import * as Dialog from '$lib/shadcn/components/ui/dialog';
	import type { Snippet } from 'svelte';

	let { identifier, ondelete, children }: { 
		identifier: string,
		ondelete: () => unknown,
		children: Snippet
	} = $props();

	let open = $state(false)
</script>

<Dialog.Root bind:open={open}>
	<Dialog.Trigger>
		{@render children()}
	</Dialog.Trigger>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Delete Grid</Dialog.Title>
			<Dialog.Description>Are you sure you want to delete "{identifier}"? This is an irreversible action.</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button on:click={async () => {
				await ondelete();
				open = false;
			}} variant="destructive"> Delete </Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>