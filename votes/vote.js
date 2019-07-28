const conseilServerInfo = { url: 'https://conseil-prod.cryptonomic-infra.tech', apiKey: 'klassare' };
const api = 'https://api.tzbeta.net:8080';
const rpc = 'https://tezos-prod.cryptonomic-infra.tech';
const PAGE_SIZE = 10;
let votingPeriod;
let bakers;
let pageCounter = 0;
$('document').ready(function(){
	init();
});
function showMsg(m){
  alert(m);
}
async function init() {
	const head = await conseiljs.TezosConseilClient.getBlockHead(conseilServerInfo, 'mainnet');
	votingPeriod = head.meta_voting_period;
	const blocksRemaining = 32768 - head.meta_voting_period_position;
	const periodKind = head.period_kind;
	const quorum = head.current_expected_quorum;
	setCountDown(blocksRemaining);
	switch(periodKind) {
		case 'proposal':
			$("#h1").addClass("active");
			$("#title").text("Proposal vote");
			$("#p1").css("display", "inline-block");
			getProposalVotes(periodKind);
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
	const bakers = await fetch(rpc + '/chains/main/blocks/head/votes/listings')
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
	const ballotResult = await fetch(rpc + '/chains/main/blocks/head/votes/ballots')
		.then(function(ans) {return ans.json();});
	return ballotResult;
}
/*
	### Get Proposal votes ###
*/
async function getProposalVotes(periodKind) {
	let promises = [];
	promises.push(getProposalResult());
	promises.push(getRecentProposalVotes());
	promises.push(getRollCount());
	let proposalResult, votes, totalRolls;
	await Promise.all(promises)
		.then(res => {
			proposalResult = res[0];
			votes = res[1];
			bakers = res[2].bakers;
			totalRolls = res[2].totalRolls;
		});
	if (proposalResult.length === 0) {
		$("#p1 #proposals").append("<tr><td>No proposals yet...</td><td>-</td><td>-</td></tr>");
	}
	for (var i = 0; i < proposalResult.length; i++) {
		proposalHash2alias(proposalResult[i][0])
		proposalLabel = proposalHash2alias(proposalResult[i][0], true)
		if (proposalLabel !== proposalResult[i][0]) {
			if (proposalLabel.url)
				proposalLabel = '<a href="' + proposalLabel.url + '" target="_blank">' +proposalLabel.alias + '</a> - ' + proposalResult[i][0];
			else
			proposalLabel = proposalLabel + ' - ' + proposalResult[i][0];
		}
		$("#p1 #proposals").append("<tr><td>" + proposalLabel + "</td><td>" + proposalResult[i][1].toLocaleString() + "</td><td id=\"percentage" + i + "\"></td></tr>");
	}
	for (var i = 0; i < proposalResult.length; i++) {
		$('#p1 #proposals #percentage' + i).html(Math.round((10000*proposalResult[i][1])/totalRolls)/100+'%');
	}
	/* Recent votes */
	for (const i in votes) {
		$("#p1 .RecentVotes").append("<tr><td id=\"recentVote" + i + "\">" + votes[i].type.timeAgo + "</td><td>"
		+ bakerRolls(votes[i].type.source.tz, bakers).toLocaleString() + "</td><td>"+pkh2alias(votes[i].type.source.tz)+"</td><td>"
		+ proposalHash2alias(votes[i].type.proposals) +"</td></tr>");
	}
	if (votes.length < PAGE_SIZE)
			$("#p1 .button").css("display", "none");
	if (votes.length > 0)
		$("#p1 .RecentVotesContainer").css("display", "inline-block");
}
/*
	Get current result in a proposal vote
*/
async function getProposalResult() {
	const proposalResult = await fetch(rpc + '/chains/main/blocks/head/votes/proposals')
		.then(function(ans) {return ans.json();});
	return proposalResult;
}
async function getRecentProposalVotes(page = 0) {
	let votes = await fetch(api + '/v3/operations?type=Proposal&p=' + page + '&number=' + PAGE_SIZE)
		.then(ans => { return ans.json(); });
	let filteredVotes = [];
	for (const vote of votes) {
		if (vote.type.period === votingPeriod) {
			let proposalsFormated = '';
			for (const proposal of vote.type.proposals) {
				if (proposalsFormated === '')
					proposalsFormated = proposal;
				else
					proposalsFormated = proposalsFormated + '<BR>' + proposal;
			}
			vote.type.proposals = proposalsFormated;
			filteredVotes.push(vote);
		}
	}
	promises = [];
	for (const vote of filteredVotes) {
		promises.push(timeAgo(vote.block_hash));
	}
	const timeAgos = await Promise.all(promises);
	for (const i in filteredVotes) {
		filteredVotes[i].type.timeAgo = timeAgos[i];
	}
	return filteredVotes;
}
function loadMoreProposalVotes() {
	getRecentProposalVotes(++pageCounter).then(votes => {
		promises = [];
		for (const vote of votes) {
			promises.push(timeAgo(vote.block_hash));
		}
		for (const i in votes) {
			$("#p1 .RecentVotes").append("<tr><td id=\"recentVote" + i + "\">" + votes[i].type.timeAgo + "</td><td>"
			+ bakerRolls(votes[i].type.source.tz, bakers).toLocaleString() + "</td><td>"+pkh2alias(votes[i].type.source.tz)+"</td><td>"
			+ proposalHash2alias(votes[i].type.proposals) +"</td></tr>");
		}
		if (votes.length < PAGE_SIZE)
			$("#p1 .button").css("display", "none");
	});
	return false;
}
/* Utils */
async function setCountDown(blocks){
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
async function timeAgo(block_hash) {
	const d = await fetch(api + '/v3/timestamp/' + block_hash)
		.then(res => { return res.json(); });
	const blockTime = new Date(d);
	const timeNow = new Date();
	const timeDiff = timeNow - blockTime;
	let output = "";
	if (timeDiff < 1000 * 60 * 60) { // less than 1 hour
		output = Math.round(timeDiff / (1000 * 60)) + " minutes";
	} else {
		output = Math.round(timeDiff / (1000 * 60 * 60)) + " hours";
	}
	return output;
 }
 function bakerRolls(baker, bakers) {
	const index = bakers.findIndex(b => b.pkh === baker);
	if (index >= 0)
		return bakers[index].rolls;
	else
		return 0;
}
function pkh2alias(pkh) {
	const index = mapOfPublicBakers.findIndex(b => b.delegation_code === pkh);
	if (index >= 0)
		return mapOfPublicBakers[index].baker_name;
	return pkh
}
function proposalHash2alias(hash, appendLink = false) {
	const index = proposalMap.findIndex(p => p.hash === hash);
	if (index >= 0) {
		if (appendLink)
			return {alias: proposalMap[index].alias, url: proposalMap[index].url}
		return proposalMap[index].alias;
	}
	return hash
}