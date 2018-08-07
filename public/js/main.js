$(document).ready(() => {

	$('.sc-action').on('click', function(e) {
		e.preventDefault()

		var actionName = $(this).text()
		var actionAbi = _.find(contractAbi, function(abi) { return abi.name === actionName })
		console.log(actionAbi)
	})

});
