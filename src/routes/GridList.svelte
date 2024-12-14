<script lang="ts">
	import type { GridList } from "$lib/server/grid-service";
	import { Badge } from "$lib/shadcn/components/ui/badge";
	import * as Pagination from "$lib/shadcn/components/ui/pagination";
	import * as Table from "$lib/shadcn/components/ui/table";
	import { debounce } from "$lib/utils/debounce";
	import { createQuery, useQueryClient } from "@tanstack/svelte-query";

	let { search = $bindable() }: { search: string } = $props();
	let current_page = $state(1);
	let current_page_size = $state(15);

	const client = useQueryClient();
	const gridsQuery = createQuery(
		{
			queryKey: ["grids"],
			queryFn: async () => {
				let url = `http://localhost:5173/api/grids?page=${current_page}&page_size=${current_page_size}`;
				if (search) url += `&name=${search.toLowerCase()}`;
				if (search) url += `&tags=${search.toLowerCase()}`;
				const response = await fetch(url);
				const json = (await response.json()) as GridList;
				return json;
			},
		},
		client,
	);

	// svelte-ignore non_reactive_update
	function onPageChange(page: number) {
		current_page = page;
	}

	const refreshQuery = debounce(() => {
		void client.invalidateQueries({ queryKey: ["grids"] });
	}, 200);

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		search;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		current_page;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		current_page_size;
		refreshQuery();
	});

	function viewGridRecord(id: string) {
		window.open(`http://localhost:5173/grids/${id}`, "_blank");
	}
</script>

<section class="relative flex flex-col items-center justify-start">
	{#if $gridsQuery.isLoading}
		Loading ...
	{/if}

	{#if $gridsQuery.error}
		Error: {$gridsQuery.error.message}
	{/if}

	{#if $gridsQuery.isSuccess}
		<div class="relative flex w-[52rem]">
			<Table.Root class="">
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head class="text-center">Size</Table.Head>
						<Table.Head>Tags</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each $gridsQuery.data.data as grid (grid.id)}
						<Table.Row class="cursor-pointer" on:click={() => viewGridRecord(grid.id)}>
							<Table.Cell>{grid.name}</Table.Cell>
							<Table.Cell class="text-center">{grid.size}×{grid.size}</Table.Cell>
							<Table.Cell>
								{#each grid.tags as tag}
									<Badge class="mr-1">{tag}</Badge>
								{/each}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</section>

<section class="relative my-8 flex flex-col items-center justify-start">
	<Pagination.Root
		count={$gridsQuery.data?.count ?? 0}
		perPage={current_page_size}
		let:pages
		let:currentPage
		bind:onPageChange>
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton />
			</Pagination.Item>
			{#each pages as page (page.key)}
				{#if page.type === "ellipsis"}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else if page.value > 0}
					<Pagination.Item>
						<Pagination.Link {page} isActive={currentPage == page.value}>
							{page.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton />
			</Pagination.Item>
		</Pagination.Content>
	</Pagination.Root>
</section>
