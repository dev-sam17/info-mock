// const BASE_URL = 'http://localhost:3000'
const BASE_URL = 'https://trading-stats.com'

const storedToken = localStorage.getItem('token')
// console.log('storedToken', storedToken)

if (!storedToken) {
	window.location.href = 'index.html'
}

const format = (x) => parseFloat(x).toFixed(2)

// const EDIT_SVG = `<svg height="8" viewBox="0 0 8 8" width="8" xmlns="http://www.w3.org/2000/svg"><path d="m6 0-1 1 2 2 1-1zm-2 2-4 4v2h2l4-4z"/></svg>`
// const VIEW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" id="view"><path fill="none" d="M0 0h48v48H0z"></path><path d="M4 42h38v-6H4v6zm36-26H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h34c1.1 0 2-.9 2-2V18c0-1.1-.9-2-2-2zM4 6v6h38V6H4z"></path></svg>`
const EDIT_SVG = `<span class="material-symbols-outlined">
edit
</span>`
const VIEW_2 = `<span class="material-symbols-outlined">
Info
</span>`

const headerReference = document.getElementById('header')

function reqData() {
	return postData(new URL('/balance/current', BASE_URL).href, {
		email: 1,
	})
}

function updateData() {
	const cardContainer = document.getElementById('cardContainer')
	const existingCards = cardContainer.querySelectorAll('.card')

	const existingUserIds = []
	existingCards.forEach((card) => {
		const userId = card.querySelector('h2').textContent
		existingUserIds.push(userId)
	})

	reqData().then((apiResponse = []) => {
		// console.log(window.location)
		// if (window.location.toString().startsWith('file')) {
		// 	apiResponse.role = 'ADMIN' // DEBUG
		// }

		// Total balance
		let totalBalance = 0
		apiResponse.records.forEach((accountData) => {
			totalBalance += parseFloat(accountData.total)
		})

		// console.log('RATES', apiResponse.rates)
		const btcRate = apiResponse.rates.find(
			(rate) => rate.currency === 'BTC'
		).value
		const ethRate = apiResponse.rates.find(
			(rate) => rate.currency === 'ETH'
		).value

		headerReference.innerHTML = formatHeader(totalBalance, btcRate, ethRate)

		// ACCOUNT INFO
		const accountDataById = {} // Map account data by user_id

		// Prepare data map for quick access
		apiResponse.records
			.filter((accountData) => accountData.visible)
			.forEach((accountData) => {
				accountDataById[accountData.user_id] = accountData
			})

		// Update individual cards or create new ones
		existingCards.forEach((card) => {
			const userId = card.querySelector('h2').textContent
			const updatedData = accountDataById[userId]

			if (updatedData && parseFloat(updatedData.total) > 100) {
				updateCard(card, updatedData, apiResponse.role) // Update existing card
			} else {
				cardContainer.removeChild(card) // Remove stale card
			}
		})

		// Add new cards for missing users
		apiResponse.records
			.filter((accountData) => accountData.visible)
			.forEach((accountData) => {
				if (
					!existingUserIds.some(
						(user) => user === accountData.user_id
					) &&
					parseFloat(accountData.total) > 100
				) {
					// console.log('CREATE NEW CARD', accountData.user_id)
					const newCard = createCard(accountData, apiResponse.role)
					cardContainer.appendChild(newCard)
				}
			})

		// console.log('UPDATE COMPLETE')
	})
}

function updateCard(card, accountData, role) {
	card.innerHTML = createCardText(accountData, role)

	if (card.querySelector('.edit-button')) {
		card.querySelector('.edit-button').addEventListener('click', () => {
			window.location.href = `update.html?userId=${accountData.user_id}&name=${accountData.nickname}&min=${accountData.min}&visible=${accountData.visible}`
		})
	}

	if (card.querySelector('.view-button')) {
		card.querySelector('.view-button').addEventListener('click', () => {
			window.location.href = `info.html?userId=${accountData.user_id}&name=${accountData.nickname}`
		})
	}
}

function createCard(accountData, role) {
	// Create a new card element with content from data
	const card = document.createElement('div')
	card.className = 'card'

	card.innerHTML = createCardText(accountData, role)

	if (card.querySelector('.edit-button')) {
		card.querySelector('.edit-button').addEventListener('click', () => {
			window.location.href = `update.html?userId=${accountData.user_id}&name=${accountData.nickname}&min=${accountData.min}&visible=${accountData.visible}`
		})
	}

	if (card.querySelector('.view-button')) {
		card.querySelector('.view-button').addEventListener('click', () => {
			window.location.href = `info.html?userId=${accountData.user_id}&name=${accountData.nickname}`
		})
	}

	return card
}

function createCardText(accountData, role = 'MANAGER') {
	const date = new Date(accountData.modified_at).toLocaleString()

	const isKucoin = accountData.type === 'kucoin'
	const isMainAccount = accountData.is_main_account

	const apiKeysSet = accountData.has_api_key
	const apiValue = !apiKeysSet
		? `<div class="details" style="color: red;">API KEY NOT SET!</div>`
		: ''
	const apiKeyDiv = role === 'ADMIN' ? apiValue : ''

	const minStyle = accountData.min ? '' : `style="color: red;"`
	const minValue = accountData.min ? '$' + format(accountData.min) : 'NOT SET'

	const minDiv =
		role === 'ADMIN'
			? `<div class="details" ${minStyle}>Minimum: ${minValue}</div>`
			: ''

	const spotDiv = `<div class="details">Spot: $${format(accountData.spot)} ${
		accountData.spot_coins && !isMainAccount
			? '(' + accountData.spot_coins + ')'
			: ''
	}</div>`

	const futuresDiv = `<div class="details">Futures: $${format(
		accountData.futures
	)}</div>`

	const editButton =
		role === 'ADMIN'
			? `<button class="edit-button">${EDIT_SVG}</button>`
			: ''

	const viewButton = `<button class="view-button">${VIEW_2}</button>`
	// const viewButton = `<button class="view-button">View Details</button>`

	return `
	<h2>${isMainAccount ? '' : accountData.user_id} ${
		accountData.nickname ? '(' + accountData.nickname + ')' : ''
	}</h2>
	<div class="balance">$${format(accountData.total)}</div>
	${isMainAccount || isKucoin ? '' : minDiv}
	${isMainAccount || isKucoin ? '' : apiKeyDiv}
	${spotDiv}
	${isMainAccount || isKucoin ? '' : futuresDiv}
	<div class="details">Last updated on: ${date}</div>
	<div class="button-container">
	${isMainAccount || isKucoin ? '' : editButton}
	${isMainAccount || isKucoin ? '' : viewButton}
	</div>
	`
}

document.addEventListener('DOMContentLoaded', updateData)
setInterval(updateData, 2500)

function formatHeader(total, btc, eth) {
	return (
		`<span>TOTAL $${format(total)}</span>` +
		`<span style="padding-left: 35px;">$${format(btc)} ₿</span>` +
		`<span style="padding-left: 35px;">$${format(eth)} ♢</span>`
	)
}

document.getElementById('logoutButton').addEventListener('click', function () {
	localStorage.removeItem('token')
	window.location.href = 'index.html'
})

async function postData(url = '', data = {}) {
	const storedToken = localStorage.getItem('token')

	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		// credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${storedToken}`,
		},
		// redirect: 'follow', // manual, *follow, error
		// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data), // body data type must match "Content-Type" header
	})

	return response.json() // parses JSON response into native JavaScript objects
}
