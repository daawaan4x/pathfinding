<script lang="ts">
	import { Badge } from "$lib/shadcn/components/ui/badge";
	import { Button } from "$lib/shadcn/components/ui/button";
	import * as Dialog from "$lib/shadcn/components/ui/dialog";
	import { Input } from "$lib/shadcn/components/ui/input";
	import { Label } from "$lib/shadcn/components/ui/label";
	import { GridNode, type CreateGridDto } from "$lib/types/grid-service";
	import type { Snippet } from "svelte";

	let {
		oncreate,
		children,
	}: {
		oncreate: (data: CreateGridDto) => unknown;
		children: Snippet;
	} = $props();

	let open = $state(false);

	let name: string | undefined = $state(undefined);
	let size: number | undefined = $state(undefined);
	let tags: string[] = $state([]);
	let data = $derived.by(() => {
		if (!name || !size) return undefined;
		return {
			name,
			data: new Array<GridNode>(size * size).fill(GridNode.empty),
			size,
			tags,
		} satisfies CreateGridDto;
	});

	let tags_temp: string | undefined = $state(undefined);
	function addTag(event: KeyboardEvent) {
		if (event.key != "Enter") return;

		if (!tags_temp) return;

		if (tags.length >= 10) return;

		if (tags.includes(tags_temp)) return;

		tags.push(tags_temp);
		tags_temp = undefined;
	}

	function removeTag(t: string) {
		tags = tags.filter((tag) => tag != t);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{@render children()}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Grid</Dialog.Title>
			<Dialog.Description>Specify name & size. Click "Create" when you're done.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input
					bind:value={name}
					max="30"
					required={true}
					id="name"
					placeholder="Enter name up to 30 characters"
					class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="size" class="text-right">Size</Label>
				<Input
					bind:value={size}
					min="5"
					max="30"
					required={true}
					placeholder="Enter from 5-30 size"
					type="number"
					id="size"
					class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="tags" class="text-right">Tags</Label>
				<Input
					bind:value={tags_temp}
					max="30"
					required={true}
					id="tags"
					placeholder="Enter up to 10 tags!"
					class="col-span-3"
					on:keypress={addTag} />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<div></div>
				<div class="col-span-3">
					{#each tags as tag}
						<!-- eslint-disable-next-line svelte/valid-compile -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="mr-1 inline-flex cursor-pointer" onclick={() => removeTag(tag)}>
							<Badge>{tag}</Badge>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button
				disabled={!data}
				on:click={async () => {
					if (!data) return;
					await oncreate(data);
					open = false;
				}}>
				Create
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
