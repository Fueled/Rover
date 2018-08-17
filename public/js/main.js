/* eslint-env jquery, browser */
$(document).ready(() => {
	let currentContract
	let explorerApplication

	if (typeof web3 !== 'undefined') {
		web3 = new Web3(web3.currentProvider);
	} else {
		web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/"));
	}

	if (typeof contractAbi !== "undefined") {
		currentContract = new web3.eth.Contract(contractAbi, contractAddress);
		abiDecoder.addABI(contractAbi);
		explorerApplication = new Web3Resolver(currentContract, [
			{
				name: "data",
				method: "encodeABI",
				options: {}
			}
		]);
	}

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
							displayTransactionDetails(receipt)
						})
						.on("error", function (error) {
							// TODO: Handle error by showing Dialog
							console.log(error);
						});
				});
			});
	});

	$(".sc-action").on("click", function (e) {
		e.preventDefault()
		clearContainers()

		var actionName = $(this).text();
		createInputListForAction(actionName)
	});

	$(".sc-variable").on("click", function (e) {
		e.preventDefault();
		clearContainers()

		var variableName = $(this).text();
		invokeEthCallRequestForMethod(variableName)
	});

	$(".sc-event").on("click", function (e) {
		e.preventDefault();
		clearContainers()

		let eventName = $(this).text();
		displayPastEvents(eventName);
	})

	function invokeEthCallRequestForMethod(variableName) {
		explorerApplication.getTransactionConfig(variableName).then(data => {
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
	}

	function createInputListForAction(actionName) {
		var actionAbi = _.find(contractAbi, function (abi) {
			return abi.name === actionName;
		});

		let input = _.template($("#inputlist").html());

		$("#input-form").html(input({
			inputs: actionAbi.inputs,
			payable: actionAbi.payable,
			action: actionAbi.name
		}));
	}

	function removePaddedZeros(address) {
		let numberString = web3.utils.hexToNumberString(address)
		return web3.utils.toHex(numberString)
	}

	function displayTransactionDetails(receipt) {
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
	}

	function displayPastEvents(eventName) {
		currentContract.getPastEvents(eventName, {
			fromBlock: 0,
			toBlock: 'latest'
		}, function (error, events) {
			displayEvent(events, eventName)
		})
	}

	function displayEvent(events, eventName) {
		let eventsTemplate = _.template($("#past-events-template").html());
		$("#event-details").html(eventsTemplate({
			events: events,
			eventName: eventName
		}))
	}
});

function clearContainers() {
	$("#input-form, #transaction-hash, #transaction-details, #output, #event-details").empty();
}