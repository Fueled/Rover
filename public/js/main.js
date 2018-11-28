/* eslint-env jquery, browser */
$(document).ready(() => {
    let currentContract;
    let explorerApplication;
    let config = {
        handlers: {
            // Prompt the user to e.g. install MetaMask or download Trust
            noWeb3Handler: () => {
                console.error('No web3 instance detected.')
            },
            // Check blockchain-dependent data
            web3Ready: () => {
                console.log('web3 initialized.')
                initRover()
            },
            // Notify the user of error, deal with unsupported networks
            web3ErrorHandler: (error) => {
                if (error.name === "error") {
                    console.error(error.message)
                } else {
                    console.error(`web3 Error: ${error}`)
                }
            },
            // Notify the user that they have switched networks, potentially re-instatiate smart contracts
            web3NetworkChangeHandler: (networkId, oldNetworkId) => {
                console.log(`Network switched from ${oldNetworkId} to ${networkId}.`)
            },
            // Notify the user that they have switched accounts, update balances
            web3AccountChangeHandler: (account, oldAccount) => {
                if (account === null) {
                    console.log('No account detected, a password unlock is likely required.')
                } else {
                    console.log(`Primary account switched from ${oldAccount} to ${account}.`)
                }
            }
        },
        pollTime: 1000, // 1 second
        supportedNetworks: [1, 3, 4, 42] // mainnet, ropsten, rinkeby, kovan
    }

    console.log('Initializing web3 upon page load.')
    window.w3w.initializeWeb3(config)

    function initRover() {
        let web3 = w3w.getWeb3js();

        if (typeof contractAbi !== "undefined") {
            currentContract = w3w.getContract(contractAbi, contractAddress);
            abiDecoder.addABI(contractAbi);

            explorerApplication = new Web3Resolver(currentContract, [{
                name: "data",
                method: "encodeABI",
                options: {}
            }]);
        }

        $(document).on("click", ".send-transaction", function (e) {
            e.preventDefault();

            let formData = $("#input-params").serializeArray();
            let filterFormData = _.filter(formData, (input) => {
                return input.name !== "ethereum"
            });
            let ethereumInput = _.find(formData, (input) => {
                return input.name === "ethereum"
            });
            let amount = web3.utils.toWei(typeof ethereumInput !== 'undefined' ? ethereumInput.value : '0');
            let transactionParams = _.map(filterFormData, "value");
            let methodName = $(this).attr("rel");

            explorerApplication
                .getTransactionConfig(methodName, transactionParams)
                .then(data => {
                    w3w.sendTransaction({
                        from: w3w.getAccount(),
                        to: data["address"],
                        data: data["data"],
                        value: amount
                    })
                    .once("transactionHash", function (hash) {
                        let transactionHashTemplate = _.template($("#transaction-hash-template").html());
                        $("#transaction-hash").html(transactionHashTemplate({
                            hash: hash
                        }));
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
            var mappedResults = [];
            let resultKeys = _.keys(results);
            _.each(outputs, function (output, index) {
                output.result = typeof results !== 'object' ? results : results[resultKeys[index]];
                mappedResults.push(output)
            });
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
            currentContract.getPastEvents(eventName, {
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
    }
});