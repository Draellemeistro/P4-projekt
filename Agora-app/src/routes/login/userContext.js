import { writable } from 'svelte/store';

export const userContext = writable({ personId: null, voteId: null });