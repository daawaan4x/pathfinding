<script lang="ts">
	import { Eraser, Pen, Play, Save, ArrowLeft } from "lucide-svelte";
	import { Badge } from "$lib/shadcn/components/ui/badge";
	import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
	import type { PageData } from "./$types";
	import GridCanvas from "./GridCanvas.svelte";
	import type { PointerType } from "./GridCanvasHelpers";
	import type { GridRecord } from "$lib/types/grid-service";
	import ToggleGroup from "$lib/shadcn/components/ui/toggle-group/toggle-group.svelte";
	import ToggleGroupItem from "$lib/shadcn/components/ui/toggle-group/toggle-group-item.svelte";
	import * as Tooltip from "$lib/shadcn/components/ui/tooltip";
	import Button from "$lib/shadcn/components/ui/button/button.svelte";
	import { goto } from "$app/navigation";
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();
	let pointer: PointerType | undefined = $state("pen");

	const client = useQueryClient();
	const query = createQuery(
		{
			queryKey: ["grid"],
			queryFn: async () => {
				const url = `http://localhost:5173/api/grids/${data.id}`;
				const response = await fetch(url);
				const json = (await response.json()) as GridRecord;
				return json;
			},
			enabled: false,
		},
		client,
	);

	const update = createMutation(
		{
			mutationFn: async () => {
				if (!$query.data) return;

				const url = `http://localhost:5173/api/grids/${data.id}`;
				const response = await fetch(url, { 
					method: "PATCH",
					body: JSON.stringify({
						size: $query.data.size,
						data: $query.data.data
					})
				});
				const json = (await response.json()) as GridRecord;
				return json;
			},
			onError(error) {
				toast.error(error.name, {
					description: error.message
				})
			},
			onSuccess() {
				toast.success("Grid has been updated.")
			}
		}, 
		client
	);

	onMount(() => {
		void $query.refetch();
	})
</script>

<div class="relative min-h-screen flex flex-col">
	<header class="relative flex justify-center pt-8">
		<Button class="fixed top-4 left-4" variant="outline" on:click={() => goto("http://localhost:5173/")}>
			<ArrowLeft size="20px" />
			<div>Back</div>
		</Button>
		<div class="pr-11">
			<h1 class="text-xl font-bold">
				{$query.data?.name}
			</h1>
		</div>
	</header>

	<main class="relative flex flex-1 flex-row items-center justify-center space-x-3">
		<section class="relative h-[600px] space-y-1 flex flex-col">
			{#if $query.data}
				{#each $query.data.tags as tag}
					<div class="relative flex justify-end">
						<Badge class="mr-1">{tag}</Badge>
					</div>
				{/each}
			{/if}
		</section>

		<GridCanvas bind:pointer bind:data={$query.data} />

		<section class="space-y-12">
			<ToggleGroup type="single" class="flex-col rounded-md border p-1" bind:value={pointer}>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<ToggleGroupItem class="px-[6px]" value="pen">
							<Pen
								strokeWidth={pointer == "pen" ? 3 : 2}
								class={pointer == "pen" ? "black" : "text-muted-foreground"} />
						</ToggleGroupItem>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">Add Block</Tooltip.Content>
				</Tooltip.Root>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<ToggleGroupItem class="px-[6px]" value="eraser">
							<Eraser
								strokeWidth={pointer == "eraser" ? 3 : 2}
								class={pointer == "eraser" ? "black" : "text-muted-foreground"} />
						</ToggleGroupItem>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">Erase</Tooltip.Content>
				</Tooltip.Root>
				<Button class="px-[6px]" on:click={() => $update.mutateAsync()}>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Save />
						</Tooltip.Trigger>
						<Tooltip.Content side="right">Save Grid</Tooltip.Content>
					</Tooltip.Root>
				</Button>
			</ToggleGroup>

			<div class="flex-col rounded-md border p-1">
				<Button class="px-[6px]">
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Play />
						</Tooltip.Trigger>
						<Tooltip.Content side="right">Run Algorithm</Tooltip.Content>
					</Tooltip.Root>
				</Button>
			</div>
		</section>
	</main>
</div>
