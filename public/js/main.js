$(document).ready(() => {
	if (typeof web3 != "undefined") {
		web3 = new Web3(web3.currentProvider);
	} else {
		web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/"));
	}

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
							const decodedLogs = abiDecoder.decodeLogs(receipt.logs);

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
