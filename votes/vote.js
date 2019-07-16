const conseilServerInfo = { url: 'https://conseil-prod.cryptonomic-infra.tech', apiKey: 'klassare' };
$('document').ready(function(){
	init();
});
function showMsg(m){
  alert(m);
}
async function init() {
	const head = await conseiljs.TezosConseilClient.getBlockHead(conseilServerInfo, 'mainnet').then(
		((ans) => ans[0])
	);
	const votingPeriod = head.meta_voting_period;
	const blocksRemaining = 32768 - head.meta_voting_period_position;
	const periodKind = head.period_kind;
	const quorum = head.current_expected_quorum;
	setCountDown(blocksRemaining);
	switch(periodKind) {
		case 'proposal':
			$("#h1").addClass("active");
			$("#title").text("Proposal vote");
			$("#p1").css("display", "inline-block");
			getProposalVotes();
			break;
		case 'testing_vote':
			$("#h2").addClass("active");
			$("#title").text("Exploration vote");
			$("#p2").css("display", "inline-block");
			getBallotVotes(quorum);
			break;
		case 'testing':
			$("#h3").addClass("active");
			$("#title").text("Testing phase");
			break;
		case 'promotion_vote':
			$("#h4").addClass("active");
			$("#title").text("Promotion vote");
			$("#p2").css("display", "inline-block");
			getBallotVotes(quorum);
			break;
		default:
			throw new Error('No voting period found!');
	}
}
/*
	### Get all data for ballot votes ###
*/
async function getBallotVotes(quorum) {
	const ballotResult = await getBallotResult();
	
	$('#p2 .a2').html(ballotResult.yay.toLocaleString());
	$('#p2 .b2').html(ballotResult.nay.toLocaleString());
	$('#p2 .c2').html(ballotResult.pass.toLocaleString());
	const voted = ballotResult.yay + ballotResult.nay + ballotResult.pass;
	const yesPercentage = Math.round(10000*ballotResult.yay/(ballotResult.yay + ballotResult.nay))/100;
	$('#p2 .a3').html(Math.round(10000*ballotResult.yay/(ballotResult.yay + ballotResult.nay))/100+'%');
	$('#p2 .b3').html(Math.round(10000*ballotResult.nay/(ballotResult.yay + ballotResult.nay))/100+'%');
	$('#p2 .c3').html('-');
	$('#p2 .f3').html(quorum/100+'%');
	$('#p2 .g2').html(Math.round((ballotResult.yay + ballotResult.nay)*quorum/10000).toLocaleString());
	
	/* Progress bars */
	$('#progress2 .bar-step').css('left', quorum / 100 + '%');
	$('#progress2 .label-percent').html(quorum / 100 + '%');
	$('#progress1 .progress-bar').css('width', yesPercentage+'%');
	$('#progress1 .progress-bar').html(yesPercentage+'%');
	if (yesPercentage > 80) {
		$('#progress1 .progress-bar').addClass("progress-bar-success");
	} else if (yesPercentage > 40) {
		$('#progress1 .progress-bar').addClass("progress-bar-warning");
	} else {
		$('#progress1 .progress-bar').addClass("progress-bar-danger");
	}
	
	const {bakers, totalRolls} = await getRollCount();
	$('#p2 .d2').html(voted.toLocaleString());
	const votesPercentage = Math.round(10000*voted/(totalRolls))/100;
	$('#p2 .d3').html(votesPercentage+'%');
	$('#p2 .e2').html((totalRolls - voted).toLocaleString());
	$('#p2 .e3').html(Math.round(10000*(totalRolls - voted)/(totalRolls))/100+'%');
	$('#p2 .f2').html(Math.round(totalRolls * (quorum / 10000) + 0.5).toLocaleString());
	$('#progress2 .progress-bar').css('width', votesPercentage+'%');
	$('#progress2 .progress-bar').html(votesPercentage+'%');
	if (votesPercentage >= quorum/100) {
		$('#progress2 .progress-bar').addClass("progress-bar-success");
	 } else if (votesPercentage >= quorum / 200) {
		$('#progress2 .progress-bar').addClass("progress-bar-warning");
	 } else {
		$('#progress2 .progress-bar').addClass("progress-bar-danger");
	 }
}
/*
	Return number of rolls for each baker and the total number
*/
async function getRollCount() {
	const bakers	= await fetch('https://mainnet.tezrpc.me/chains/main/blocks/head/votes/listings')
		.then(function(ans) {return ans.json();});
	let totalRolls = 0;
	for (let i = 0; i < bakers.length; i++) {
		totalRolls += bakers[i].rolls;
	}
	return {bakers, totalRolls}
}
/*
	Get current result in a ballot vote
*/
async function getBallotResult() {
	const ballotResult = await fetch('https://mainnet.tezrpc.me/chains/main/blocks/head/votes/ballots')
		.then(function(ans) {return ans.json();});
	return ballotResult;
}
/*
	### Get Proposal votes ###
*/
async function getProposalVotes() {
	const proposalResult = await getProposalResult();
	for (var i = 0; i < proposalResult.length; i++) {
		$("#p1 #proposals").append("<tr><td>" + proposalResult[i][0] + "</td><td>" + proposalResult[i][1].toLocaleString() + "</td><td id=\"percentage" + i + "\"></td></tr>");
	}
	const {bakers, totalRolls} = await getRollCount();
	for (var i = 0; i < proposalResult.length; i++) {
		$('#p1 #proposals #percentage' + i).html(Math.round((10000*proposalResult[i][1])/totalRolls)/100+'%');
	}
}
/*
	Get current result in a proposal vote
*/
async function getProposalResult() {
	const proposalResult = await fetch('https://rpc.tezrpc.me/chains/main/blocks/head/votes/proposals')
		.then(function(ans) {return ans.json();});
	return proposalResult;
}

function setCountDown(blocks){
	var minutes = blocks % 60;
	var hours = (blocks - minutes) / 60;
	var days = (hours - hours % 24) / 24;
	hours = hours % 24;
	if (days === 0) {
		$("#countDown").html(hours + " hours " + minutes + " minutes");
	} else {
		$("#countDown").html(days + " days " + hours + " hours");
	}
}