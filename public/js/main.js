/* eslint-env jquery, browser */
$(document).ready(() => {
	let currentContract;
	let explorerApplication;

	if (typeof web3 !== "undefined") {
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
		let filterFormData = _.filter(formData, (input) => { return input.name !== "ethereum" })
		let ethereumInput = _.find(formData, (input) => { return input.name === "ethereum" })
		let amount = web3.utils.toWei(typeof ethereumInput !== 'undefined' ? ethereumInput.value : '0')
		let transactionParams = _.map(filterFormData, "value");
		let methodName = $(this).attr("rel");

		explorerApplication
			.getTransactionConfig(methodName, transactionParams)
			.then(data => {
				web3.eth.getAccounts(function (error, accounts) {
					web3.eth
						.sendTransaction({
							from: accounts[0],
							to: data["address"],
							data: data["data"],
							value: amount
						})
						.once("transactionHash", function (hash) {
							let transactionHashTemplate = _.template($("#transaction-hash-template").html());
							$("#transaction-hash").html(transactionHashTemplate({ hash: hash }));
						})
						.once("receipt", function (receipt) {
							console.log(receipt);
							displayTransactionDetails(receipt, data);
						})
						.on("error", function (error) {
							// TODO: Handle error by showing Dialog
							console.log(error);
						});
				});
			});
	});

	$(document).on("click", ".send-call-request", function (e) {
		e.preventDefault();

		let formData = $("#input-params").serializeArray();
		let transactionParams = _.map(formData, "value");
		let variableName = $(this).attr("rel");

		invokeEthCallRequestForMethod(variableName, transactionParams);
	});

	$(".sc-action").on("click", function (e) {
		e.preventDefault();
		clearContainers();

		var actionAbi = getAbiForAction($(this).text());
		createInputListForAction(actionAbi, false);
	});

	$(".sc-constructor").on("click", function (e) {
		e.preventDefault();
		clearContainers();

		let actionAbi = _.find(contractAbi, function (abi) {
			return abi.type === 'constructor';
		});

		createInputListForAction(actionAbi, false);
	});

	$(".sc-variable").on("click", function (e) {
		e.preventDefault();
		clearContainers();

		var variableName = $(this).text();

		var variableAbi = getAbiForAction(variableName);

		if (variableAbi.inputs.length > 0) {
			createInputListForAction(variableAbi, true);
		} else {
			invokeEthCallRequestForMethod(variableName);
		}
	});

	function getAbiForAction(actionName) {
		let abi = _.find(contractAbi, function (abi) {
			return abi.name === actionName;
		});

		return abi
	}

	$(".sc-event").on("click", function (e) {
		e.preventDefault();
		clearContainers();

		let eventName = $(this).text();
		displayPastEvents(eventName);
	});

	function invokeEthCallRequestForMethod(variableName, transactionParams) {
		currentContract.methods[variableName]
			.apply(this, transactionParams || [])
			.call()
			.then(result => {
				console.log(result);
				displayOutput(variableName, result);
			});
	}

	function displayOutput(variableName, results) {
		let abi = getAbiForAction(variableName);
		let output = _.template($("#output-template").html());
		$("#output").html(output({
			outputs: mapOutputToResults(abi.outputs, results)
		}));
	}

	function mapOutputToResults(outputs, results) {
		var mappedResults = []
		let resultKeys = _.keys(results)
		_.each(outputs, function (output, index) {
			output.result = typeof results !== 'object'? results: results[resultKeys[index]]
			mappedResults.push(output)
		})
		return mappedResults
	}

	function createInputListForAction(actionAbi, isVariable) {
		let input = _.template($("#inputlist").html());

		$("#input-form").html(input({
			inputs: actionAbi.inputs,
			payable: actionAbi.payable,
			action: actionAbi.name,
			isVariable: isVariable
		}));
	}

	function displayTransactionDetails(receipt, data) {
		let transactionTemplate = _.template($("#transaction-details-template").html());
		let eventsTemplate = _.template($("#event-list-template").html());
		const decodedLogs = abiDecoder.decodeLogs(receipt.logs);

		const formattedInput = JSON.stringify(JSON.parse(JSON.stringify(abiDecoder.decodeMethod(data["data"]))),
			null,
			2);

		$("#transaction-details").html(transactionTemplate({
			receipt: receipt,
			inputData: formattedInput
		}));

		$("#event-details").html(eventsTemplate({
			events: _.compact(decodedLogs)
		}));

		Prism.highlightAll();
	}

	function displayPastEvents(eventName) {
		currentContract.getPastEvents(eventName,
			{
				fromBlock: 0,
				toBlock: "latest"
			},
			function (error, events) {
				displayEvent(events, eventName);
			});
	}

	function displayEvent(events, eventName) {
		let eventsTemplate = _.template($("#past-events-template").html());
		$("#event-details").html(eventsTemplate({
			events: events,
			eventName: eventName
		}));
		Prism.highlightAll();
	}

	function clearContainers() {
		$("#input-form, #transaction-hash, #transaction-details, #output, #event-details").empty();
	}
});
