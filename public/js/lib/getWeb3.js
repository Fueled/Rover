async function getWeb3() {
	var accounts = web3.eth.getAccounts()
	var network = web3.eth.net.getId()
	var results

	await Promise.all([accounts, network]).then(function (values) {
			let defaultAccount = values[0]
			let netId = values[1]
			var web3 = window.web3

			// Checking if Web3 has been injected by the browser (Mist/MetaMask)
			if (typeof web3 !== 'undefined') {
				web3 = new window.Web3(web3.currentProvider) // Use Mist/MetaMask's provider.

				let netIdName, trustApiName, explorerUrl;
				console.log('netId', netId);
				switch (netId) {
					case "1":
						netIdName = 'Main Net'
						trustApiName = 'api'
						explorerUrl = 'https://etherscan.io'
						console.log('This is Foundation', netId)
						break;
					case "3":
						netIdName = 'Ropsten'
						trustApiName = 'ropsten'
						explorerUrl = 'https://ropsten.etherscan.io'
						console.log('This is Ropsten', netId)
						break;
					case "4":
						netIdName = 'Rinkeby'
						trustApiName = 'rinkeby'
						explorerUrl = 'https://rinkeby.etherscan.io'
						console.log('This is Rinkeby', netId)
						break;
					case "42":
						netIdName = 'Kovan'
						trustApiName = 'kovan'
						explorerUrl = 'https://kovan.etherscan.io'
						console.log('This is Kovan', netId)
						break;
					default:
						netIdName = 'Unknown'
						console.log('This is an unknown network.', netId)
				}

				results = {
					web3Instance: web3,
					netIdName,
					netId,
					injectedWeb3: true,
					defaultAccount,
					trustApiName,
					explorerUrl
				}
				console.log('Injected web3 detected.');
			} else {
				// Fallback to localhost if no web3 injection.
				const errorMsg = `Metamask is not installed. Please go to https://metamask.io and return to this page after you installed it`
				console.log('No web3 instance injected, using Local web3.');
				console.error('Metamask not found');
				results = { message: errorMsg }
			}
	});

	return results;
}
