$(document).ready(() => {

	$('.sc-action').on('click', function(e) {
		e.preventDefault()
		
		$('#content').empty();

		var actionName = $(this).text()
		var actionAbi = _.find(contractAbi, function(abi) { return abi.name === actionName })
		console.log(actionAbi);
		
		let input = _.template($('#inputlist').html());
		$('#content').html(input({'inputs': actionAbi.inputs, 'payable': actionAbi.payable}));
	})
});