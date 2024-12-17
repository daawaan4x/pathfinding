<script lang="ts">
	import { Input } from "$lib/shadcn/components/ui/input";
	import { Plus, Search } from "lucide-svelte";
	import GridList from "./GridList.svelte";
	import Button from "$lib/shadcn/components/ui/button/button.svelte";
	import * as Tooltip from "$lib/shadcn/components/ui/tooltip";
	import GridCreate from "./GridCreate.svelte";
	import { createMutation, useQueryClient } from "@tanstack/svelte-query";
	import { GridRecordSchema, type CreateGridDto } from "$lib/types/grid-service";
	import { toast } from "svelte-sonner";
	import { tryJSON } from "$lib/utils/try-json";

	let search = $state("");

	const client = useQueryClient();
	const gridsCreate = createMutation(
		{
			mutationFn: async (data: CreateGridDto) => {
				const url = `http://localhost:5173/api/grids`;
				const response = await fetch(url, {
					method: "POST",
					body: JSON.stringify(data),
				});

				const text = await response.text();
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const json = tryJSON(text);

				if (!response.ok) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					if (json?.error && json?.message) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						throw new Error(`${json.error}: ${json.message}`);
					} else {
						throw new Error(text);
					}
				}

				const result = GridRecordSchema.parse(json);
				return result;
			},
			onError(error) {
				toast.error(error.name, { description: error.message });
			},
			onSuccess() {
				toast.success("Grid has been added.");
				void client.invalidateQueries({ queryKey: ["grids"] });
			},
		},
		client,
	);
</script>

<main class="relative flex min-h-screen flex-col pb-16">
	<section class="relative flex flex-col items-center justify-start overflow-hidden pt-36">
		<div class="relative flex flex-col items-center text-center">
			<h1
				class="flex flex-row gap-3 bg-gradient-to-b from-black/70 to-black bg-clip-text pb-5 pt-3 text-8xl font-extrabold leading-none tracking-tight text-transparent">
				Pathfinding
			</h1>
			<p class="subheading text-base tracking-tight text-gray-500">
				visualize the
				<span class="font-bold italic">A*</span>
				algorithm on custom mazes
			</p>
		</div>
	</section>

	<section class="relative my-8 flex flex-row items-center justify-center space-x-3">
		<div class="relative w-[48rem]">
			<Search class="absolute left-5 top-[50%] h-5 w-5 translate-y-[-50%] text-muted-foreground" />
			<Input class="rounded-full p-6 pl-12" type="search" placeholder="Search by name or tag" bind:value={search} />
		</div>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<!-- eslint-disable-next-line @typescript-eslint/no-unsafe-argument -->
				<GridCreate oncreate={(data) => $gridsCreate.mutateAsync(data)}>
					<Button class="h-12 w-12 rounded-full p-0">
						<Plus />
					</Button>
				</GridCreate>
			</Tooltip.Trigger>
			<Tooltip.Content>Add Grid</Tooltip.Content>
		</Tooltip.Root>
	</section>

	<GridList bind:search />
</main>

<footer class="relative flex flex-col border-t border-gray-200 py-8">
	<section class="text-center text-xs text-gray-400">
		© {new Date().getFullYear()} Theone Eclarin. All rights reserved.
	</section>
</footer>

<style>
	@import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap");

	.subheading {
		font-family: "Roboto Mono";
	}
</style>
