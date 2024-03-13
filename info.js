const BASE_URL = 'https://trading-stats.com'

// const storedToken = localStorage.getItem('token')
// if (!storedToken) {
// 	window.location.href = 'index.html'
// }

// const params = new URL(document.location).searchParams
// const userId = params.get('userId')
// const nickName = params.get('name')
const userId = "hrgregsghs"
const nickName = "Devilicious"
// if (!userId) {
// 	window.location.href = 'admin.html'
// }

const headerReference = document.getElementById('header')
const spotTableheader = document.querySelector('.userIdHeader')

spotTableheader.textContent =
	`Spot coins for userId ${userId}` + (nickName ? ` (${nickName})` : '')

document.addEventListener('DOMContentLoaded', updateData)
setInterval(updateData, 2500)

document.getElementById('logoutButton').addEventListener('click', function () {
	localStorage.removeItem('token')
	window.location.href = 'index.html'
})

document.getElementById('header').addEventListener('click', function () {
	window.location.href = 'admin.html'
})

function format(x) {
	return parseFloat(x).toFixed(2)
}

function populateSpotTable(coins = []) {
	const tableBody = document
		.getElementById('coinTable')
		.querySelector('tbody')
	tableBody.innerHTML = ''

	for (const coin of coins) {
		const totalUsdValue =
			parseFloat(coin.available) +
			// parseFloat(coin.limitAvailable) +
			parseFloat(coin.frozen) +
			parseFloat(coin.locked)

		if (totalUsdValue > 20) {
			const row = tableBody.insertRow()
			row.insertCell(0).textContent = coin.coin
			row.insertCell(1).textContent = totalUsdValue
			row.insertCell(2).textContent = `$${parseFloat(coin.rate).toFixed(
				5
			)}`
			row.insertCell(3).textContent = `$${format(coin.usd_value)}`
			const sellCell = row.insertCell(4);
        const sellButton = document.createElement('button');
        sellButton.textContent = 'X';
        sellButton.addEventListener('click', () => openSpotCoinModal(coin.coin, totalUsdValue, coin.rate, coin.usd_value));
        sellCell.appendChild(sellButton);
		}
	}
}

function populateFuturesTable(infoArray = []) {
	const tableBody = document
		.getElementById('marginTable')
		.querySelector('tbody')
	tableBody.innerHTML = ''

	for (const info of infoArray) {
		const row = tableBody.insertRow()
		row.insertCell(0).textContent = info.margin_coin
		row.insertCell(1).textContent = info.symbol
		row.insertCell(2).textContent = info.leverage
			? 'x' + String(info.leverage)
			: ''
		row.insertCell(3).textContent = format(info.margin_size)
		row.insertCell(4).textContent = info.hold_side
		row.insertCell(5).textContent = info.total
		const buttonCell = row.insertCell(6);
        const button = document.createElement('button');
        button.textContent = 'X';
        button.addEventListener('click', () => openCloseTradePopup(info.margin_coin, info.symbol, info.leverage, info.margin_size, info.hold_side, info.total));
        buttonCell.appendChild(button); 
	}
}

//function to open SpotCoin popup
function openSpotCoinModal(coin, quantity, rate, total_usd_value) {
    // Populate the modal with the coin details
    document.getElementById('modalCoin').textContent = `Coin: ${coin}`;
    document.getElementById('modalQuantity').textContent = `Quantity: ${quantity}`;
    document.getElementById('modalRate').textContent = `Rate: ${rate}`;
    document.getElementById('modalTotalValue').textContent = `Total USD Value: ${total_usd_value}`;

    // Show the modal
    document.getElementById('spotTradeModal').style.display = "block";
}


// Function to confirm sell assets and show success message
function confirmAssetsSale(modalId){
	// Perform the API call to close the trade here
	console.log('Sale done successfully');

	// Show success message
	const modalContent = document.getElementById(modalId).querySelector('.modal-replace');
	modalContent.innerHTML = '<p>Sale Done successfully!</p>';

	// Optionally, set a timeout to hide the modal after a few seconds
	setTimeout(() => {
		closeModal(modalId);
	}, 5000);
}

// function to open close trade popup
function openCloseTradePopup(marginCoin, symbol, leverage, margin_size, hold_side, total) {
    // Populate the modal with the trade details
    document.getElementById('modalMarginCoin').textContent = `Margin Coin: ${marginCoin}`;
    document.getElementById('modalSymbol').textContent = `Symbol: ${symbol}`;
    document.getElementById('modalLeverage').textContent = `Leverage: ${leverage}`;
    document.getElementById('modalMarginSize').textContent = `Margin Size: ${margin_size}`;
    document.getElementById('modalHoldSide').textContent = `Hold Side: ${hold_side}`;
    document.getElementById('modalTotal').textContent = `Total: ${total}`;

    // Show the modal
    document.getElementById('closeTradeModal').style.display = "block";
}

// Function to confirm close trade and show success message
function confirmCloseTrade(modalId) {
    // Perform the API call to close the trade here
    console.log('Trade closed successfully');

    // Show success message
    const modalContent = document.getElementById(modalId).querySelector('.modal-replace');
    modalContent.innerHTML = '<p>Trade closed successfully!</p>';

    // Optionally, set a timeout to hide the modal after a few seconds
    setTimeout(() => {
        closeModal(modalId);
    }, 5000);
}

 // Attach event listener for static "Confirm Sale" and "Confirm Close Trade" buttons
 document.querySelector('.confirmSale').addEventListener('click', function() {
	confirmAssetsSale('spotTradeModal');
});

document.querySelector('.confirmCloseTrade').addEventListener('click', function() {
	confirmCloseTrade('closeTradeModal');
});

//  Function to close the popup
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

 // Attach event listeners for static modals
 document.querySelectorAll('.close').forEach(closeButton => {
	closeButton.addEventListener('click', function() {
		this.closest('.modal').style.display = "none";
	});
});

// When the user clicks anywhere outside of the modals, close them
window.onclick = function (event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}


const spotInfo = [
    {"coin": "BTC", "available": 65, "frozen": 0.1, "locked": 0.05, "rate": 20000, "usd_value": 6500},
    {"coin": "ETH", "available": 10, "frozen": 342, "locked": 1, "rate": 1500, "usd_value": 19500},
    {"coin": "USDT", "available": 5000, "frozen": 500, "locked": 250, "rate": 1, "usd_value": 5750}
];

const futuresInfo = [
    {"margin_coin": "USDT", "symbol": "BTCUSDT", "leverage": 10, "margin_size": 1000, "hold_side": "long", "total": 15000},
    {"margin_coin": "USDT", "symbol": "ETHUSDT", "leverage": 5, "margin_size": 500, "hold_side": "short", "total": 7500}
];


function reqData() {
	return postData(new URL('/balance/current', BASE_URL).href, {
		email: 1,
	})
}

function updateData() {
	// reqData().then((apiResponse = []) => {
	// 	// Total balance
	// 	let totalBalance = 0
	// 	apiResponse.records.forEach((accountData) => {
	// 		totalBalance += parseFloat(accountData.total)
	// 	})

	// 	// console.log('RATES', apiResponse.rates)
	// 	const btcRate = apiResponse.rates.find(
	// 		(rate) => rate.currency === 'BTC'
	// 	).value
	// 	const ethRate = apiResponse.rates.find(
	// 		(rate) => rate.currency === 'ETH'
	// 	).value

	// 	headerReference.innerHTML = formatHeader(totalBalance, btcRate, ethRate)

	// 	const spotInfo = apiResponse.spotInfo.filter(
	// 		(x) => x.user_id === userId
	// 	)

	// 	const futuresInfo = apiResponse.futuresInfo.filter(
	// 		(x) => x.user_id === userId
	// 	)

		populateSpotTable(spotInfo)
		populateFuturesTable(futuresInfo)
	// })
}

function formatHeader(total, btc, eth) {
	return (
		`<span>TOTAL $${format(total)}</span>` +
		`<span style="padding-left: 35px;">$${format(btc)} ₿</span>` +
		`<span style="padding-left: 35px;">$${format(eth)} ♢</span>`
	)
}

async function postData(url = '', data = {}) {
	const storedToken = localStorage.getItem('token')

	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${storedToken}`,
		},
		body: JSON.stringify(data),
	})

	return response.json()
}
