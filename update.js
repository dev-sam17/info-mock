// const BASE_URL = 'http://localhost:3000'
const BASE_URL = 'https://trading-stats.com'

const storedToken = localStorage.getItem('token')
// console.log('storedToken', storedToken)

if (!storedToken) {
	window.location.href = 'index.html'
}

let params = new URL(document.location).searchParams
let userId = params.get('userId')
let storedName = params.get('name')
let storedMin = params.get('min')
// let storedVisible = params.get('visible')

if (!userId) {
	window.location.href = 'admin.html'
}

const formHeader = document.getElementById('formHeader')
const nameReference = document.getElementById('nameInput')
const minReference = document.getElementById('minInput')
const keyReference = document.getElementById('keyInput')
const secretReference = document.getElementById('secretInput')

formHeader.innerText = `Update info for ${userId}`

if (storedName) {
	nameReference.value = storedName
}
if (storedMin) {
	minReference.value = storedMin
}

// Handle form submission
document
	.getElementById('updateForm')
	.addEventListener('submit', function (event) {
		event.preventDefault()
		const name = nameReference.value
		const min = minReference.value
		const key = keyReference.value
		const secret = secretReference.value

		const hidden = document.getElementById('optionHidden').checked == true

		// console.log('Form submit data: ', {
		// 	userId,
		// 	name,
		// 	min,
		// 	hidden,
		// 	key,
		// 	secret,
		// })

		updateData(userId, name, min, hidden, key, secret).then((response) => {
			// console.log('UPDATE API RESPONSE', response)

			if (response.success) {
				window.location.href = 'admin.html'
			} else {
				// console.log('ERROR', response)
			}
		})
	})

function updateData(userId, name, min, hidden, key, secret) {
	return postData(new URL('/balance/update', BASE_URL).href, {
		userId,
		name,
		min,
		hidden,
		key,
		secret,
	})
}

document.getElementById('logoutButton').addEventListener('click', function () {
	localStorage.removeItem('token')
	window.location.href = 'index.html'
})

document.getElementById('home').addEventListener('click', function () {
	window.location.href = 'admin.html'
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
