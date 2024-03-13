const BASE_URL = 'http://localhost:3000'

const storedToken = localStorage.getItem('token')
if (storedToken) {
	window.location.href = 'admin.html'
}

document.getElementById('loginButton').addEventListener('click', function () {
	const email = document.getElementById('email').value
	const password = document.getElementById('password').value

	login(email, password).then((data) => {
		// console.log('LOGIN RESPONSE', data)
		const { success, token } = data

		if (success) {
			localStorage.setItem('token', token)
			window.location.href = 'admin.html'
		}
	})
})

function login(email, password) {
	return postData(new URL('/login', BASE_URL).href, { email, password })
}

async function postData(url = '', data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		// credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json',
		},
		// redirect: 'follow', // manual, *follow, error
		// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data), // body data type must match "Content-Type" header
	})

	return response.json() // parses JSON response into native JavaScript objects
}
