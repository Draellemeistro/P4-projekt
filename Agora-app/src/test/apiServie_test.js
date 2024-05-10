// import { test } from 'vitest'
// import { fetchEmail, serverIP, serverPort } from '../utils/apiService.js';
//
// test('fetchEmail sends the correct data and receives successful response', async ({ fetch }) => {
// 	// Mock successful response
// 	const mockResponse = { message: 'Success' }
// 	fetch.mock(`http://${serverIP}:${serverPort}/get-email`, mockResponse)
//
// 	const personId = 'validPersonId'
// 	const voteId = 'validVoteId'
//
// 	const response = await fetchEmail(personId, voteId)
//
// 	// Check if fetch was called with correct parameters
// 	fetch.called(`http://${serverIP}:${serverPort}/get-email`, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 		body: JSON.stringify({ personId, voteId }),
// 	})
//
// 	// Check if response was successful
// 	const responseData = await response.json()
// 	expect(responseData.message).toBe('Success')
//
// 	// Restore fetch to its original state
// 	fetch.restore()
// })