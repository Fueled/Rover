$(document).ready(() => {
	if (typeof web3 != "undefined") {
		web3 = new Web3(web3.currentProvider);
	} else {
		web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/"));
	}

	let eventsReceipt = { "blockHash": "0x0c9bfd3d326d5574e0bbe2177aece7d4977fa7d42b7598e0a3dcf955a172e489", "blockNumber": 2765228, "contractAddress": null, "cumulativeGasUsed": 2171645, "from": "0xcba51f72fd47e7aaa62070fa92cec0b11087a449", "gasUsed": 2171645, "logs": [{ "address": "0xfD688bABe455fae5b253F622d8C003F0Cf6b7600", "topics": ["0xded6ebf04e261e1eb2f3e3b268a2e6aee5b478c15b341eba5cf18b9bc80c2e63"], "data": "0x", "blockNumber": 2765228, "transactionHash": "0xf60fa4df87f281bb7656ac84e5bc1a18ef4446c07ad58a9d6c3cf7fe1e384ac3", "transactionIndex": 0, "blockHash": "0x0c9bfd3d326d5574e0bbe2177aece7d4977fa7d42b7598e0a3dcf955a172e489", "logIndex": 0, "removed": false, "id": "log_93f54738" }, { "address": "0x886f782651F368d73889323E3181Af0EEf125a3b", "topics": ["0x435bf45836eaa9dad81c372adff25e1bc1c74d872a15d9f36218af4e4b903d7b"], "data": "0x000000000000000000000000fd688babe455fae5b253f622d8c003f0cf6b7600", "blockNumber": 2765228, "transactionHash": "0xf60fa4df87f281bb7656ac84e5bc1a18ef4446c07ad58a9d6c3cf7fe1e384ac3", "transactionIndex": 0, "blockHash": "0x0c9bfd3d326d5574e0bbe2177aece7d4977fa7d42b7598e0a3dcf955a172e489", "logIndex": 1, "removed": false, "id": "log_e5a1b512" }], "logsBloom": "0x00000000000000004000000000000000000000000000000000000000000002200000000000000000000000000000000000004000000080000000000000000000000000000080000000000000000000000000000000000000100000008000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000", "status": true, "to": "0x886f782651f368d73889323e3181af0eef125a3b", "transactionHash": "0xf60fa4df87f281bb7656ac84e5bc1a18ef4446c07ad58a9d6c3cf7fe1e384ac3", "transactionIndex": 0 }
	let currentContract = new web3.eth.Contract(contractAbi, contractAddress);
	abiDecoder.addABI(contractAbi);

	const explorerApplication = new Web3Resolver(currentContract, [
		{
			name: "data",
			method: "encodeABI",
			options: {}
		}
	]);

	$(document).on("click", ".send-transaction", function (e) {
		e.preventDefault();

		let formData = $("#input-params").serializeArray();
		let transactionParams = _.map(formData, "value");
		let methodName = $(this).attr("rel");

		explorerApplication
			.getTransactionConfig(methodName, transactionParams)
			.then(data => {
				web3.eth.getAccounts(function (error, accounts) {
					web3.eth
						.sendTransaction({
							from: accounts[0],
							to: data["address"],
							data: data["data"]
						})
						.once("transactionHash", function (hash) {
							let transactionHashTemplate = _.template($("#transaction-hash-template").html());
							$("#transaction-hash").html(transactionHashTemplate({ hash: hash, }));
						})
						.once("receipt", function (receipt) {
							let transactionTemplate = _.template($("#transaction-details-template").html());
							let eventsTemplate = _.template($("#event-list-template").html());
							const decodedLogs = abiDecoder.decodeLogs(eventsReceipt.logs);

							$("#transaction-details").html(transactionTemplate({
								receipt: receipt,
								inputData: data["data"]
							}));

							$("#event-details").html(eventsTemplate({
								events: _.compact(decodedLogs)
							}))
						})
						.on("error", function (error) {
							// TODO: Handle error by showing Dialog
							console.log(error);
						});
				});
			});
	});

	$(".sc-action").on("click", function (e) {
		e.preventDefault();

		$("#input-form, #transaction-hash, #transaction-details, #output, #event-details").empty();

		var actionName = $(this).text();
		var actionAbi = _.find(contractAbi, function (abi) {
			return abi.name === actionName;
		});
		console.log(actionAbi);

		let input = _.template($("#inputlist").html());

		$("#input-form").html(input({
			inputs: actionAbi.inputs,
			payable: actionAbi.payable,
			action: actionAbi.name
		}));
	});

	$(".sc-variable").on("click", function (e) {
		e.preventDefault();
		$("#input-form, #transaction-hash, #transaction-details, #output, #event-details").empty();
		var actionName = $(this).text();
		var actionAbi = _.find(contractAbi, function (abi) {
			return abi.name === actionName;
		});

		explorerApplication.getTransactionConfig(actionName).then(data => {
			web3.eth
				.call({
					to: data["address"],
					data: data["data"]
				})
				.then(data => {
					let output = _.template($("#output-template").html());
					$("#output").html(output({
						result: removePaddedZeros(data)
					}));
				});
		});
	});

	$(".sc-event").on("click", function(e) {
		$("#input-form, #transaction-hash, #transaction-details, #output, #event-details").empty();
		let eventName = $(this).text();
		let eventsTemplate = _.template($("#past-events-template").html());

		currentContract.getPastEvents(eventName, {
			fromBlock: 0,
			toBlock: 'latest'
		}, function (error, events) {
			$("#event-details").html(eventsTemplate({
				events: events,
				eventName: eventName
			}))
		})
	})

	function removePaddedZeros(address) {
		let numberString = web3.utils.hexToNumberString(address)
		return web3.utils.toHex(numberString)
	}
});
