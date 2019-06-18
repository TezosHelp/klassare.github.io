$('document').ready(function(){
	init();
});
function showMsg(m){
  alert(m);
}
async function init() {
	var pInfo = await getPeriodInfo();
	var kind = pInfo.kind;
	if (kind == "proposal") {
		$("#h1").addClass("active");
		$("#title").text("Proposal vote");
		$("#p1").css("display", "inline-block");
		setCountDown((pInfo.period + 1) * 32768 - pInfo.level);
		var totalVotes = await updateUnusedVotes(pInfo.period);
		updateVotes(totalVotes);
		getBakerVotes(kind);
	} else if (kind == "testing_vote") {
		$("#h2").addClass("active");
		$("#title").text("Exploration vote");
		$("#p2").css("display", "inline-block");
		setCountDown((pInfo.period + 1) * 32768 - pInfo.level);
		ballot(pInfo.period, kind, pInfo.quorum);
		getBakerVotes(kind);
	} else if (kind == "testing") {
		$("#h3").addClass("active");
		$("#title").text("Testing phase");
		setCountDown((pInfo.period + 1) * 32768 - pInfo.level);
	} else {
		$("#h4").addClass("active");
		$("#title").text("Promotion vote");
		$("#p2").css("display", "inline-block");
		setCountDown((pInfo.period + 1) * 32768 - pInfo.level);
		ballot(pInfo.period, kind, pInfo.quorum);
		getBakerVotes(kind);
	}
}
function getPeriodInfo(){
	return new Promise(resolve => {
		$.ajax({
			type: "GET",
			url: "https://api6.tzscan.io/v3/voting_period_info",
			success: function(d){
				resolve(d);

		}});
	});
}
function ballot(period, kind, q) {
	 $.ajax({
    type: "GET",
    url: "https://api6.tzscan.io/v3/ballots/" + period + "?period_kind=" + kind,
    success: function(d){
		// showMsg(JSON.stringify(d));
		// showMsg(JSON.stringify(d.vote_yay));
		 $('#p2 .a2').html(d.vote_yay.toLocaleString());
		 $('#p2 .b2').html(d.vote_nay.toLocaleString());
		 $('#p2 .c2').html(d.vote_pass.toLocaleString());
		 var total = d.vote_yay + d.vote_nay + d.vote_pass;
		 var yesPercentage = Math.round(10000*d.vote_yay/(d.vote_yay + d.vote_nay))/100;
		 $('#p2 .a3').html(Math.round(10000*d.vote_yay/(d.vote_yay + d.vote_nay))/100+'%');
		 $('#p2 .b3').html(Math.round(10000*d.vote_nay/(d.vote_yay + d.vote_nay))/100+'%');
		 $('#p2 .c3').html('-');
		 $('#p2 .f3').html(q/100+'%');
		 $('#p2 .g2').html(Math.round((d.vote_yay + d.vote_nay)*q/10000).toLocaleString());
		 
		 /* Progress bars */
		 $('#progress2 .bar-step').css('left', q / 100 + '%');
		 $('#progress2 .label-percent').html(q / 100 + '%');
		 $('#progress1 .progress-bar').css('width', yesPercentage+'%');
		 $('#progress1 .progress-bar').html(yesPercentage+'%');
		 if (yesPercentage > 80) {
			$('#progress1 .progress-bar').addClass("progress-bar-success");
		 } else if (yesPercentage > 40) {
			$('#progress1 .progress-bar').addClass("progress-bar-warning");
		 } else {
			$('#progress1 .progress-bar').addClass("progress-bar-danger");
		 }
		 totalVotes(period, total, q, yesPercentage);
		 
    }
  });
}
function totalVotes(period, voted, q, yesP) {
	  $.ajax({
    type: "GET",
    url: "https://api6.tzscan.io/v3/total_voters/" + period,
    success: function(d){
		$('#p2 .d2').html(voted.toLocaleString());
		var votesPercentage = Math.round(10000*voted/(d.votes))/100;
		$('#p2 .d3').html(votesPercentage+'%');
		$('#p2 .e2').html((d.votes - voted).toLocaleString());
		$('#p2 .e3').html(Math.round(10000*(d.votes - voted)/(d.votes))/100+'%');
		$('#p2 .f2').html(Math.round(d.votes * (q / 10000) + 0.5).toLocaleString());
		$('#progress2 .progress-bar').css('width', votesPercentage+'%');
		$('#progress2 .progress-bar').html(votesPercentage+'%');
		if (votesPercentage >= q/100) {
			$('#progress2 .progress-bar').addClass("progress-bar-success");
		 } else if (votesPercentage >= q / 200) {
			$('#progress2 .progress-bar').addClass("progress-bar-warning");
		 } else {
			$('#progress2 .progress-bar').addClass("progress-bar-danger");
		 }
		if (period === 13 && votesPercentage > (q / yesP)) {
			$("#athensPass").css("display", "inline-block");
		}
    }
  });
}
function updateVotes(totalVotes){
  $.ajax({
    type: "GET",
    url: "https://rpc.tezrpc.me/chains/main/blocks/head/votes/proposals",
    success: function(d){
		var total = 0;
		for (var i = 0; i < d.length; i++) {
			$("#p1 #proposals").append("<tr><td>" + d[i][0] + "</td><td>" + d[i][1].toLocaleString() + "</td><td id=\"percentage" + i + "\"></td></tr>");
		}
		for (var i = 0; i < d.length; i++) {
			$('#p1 #proposals #percentage' + i).html(Math.round((10000*d[i][1])/totalVotes)/100+'%');
		}
    }
  });
}
function updateUnusedVotes(period){
	return new Promise(resolve => {
	  $.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v3/total_proposal_votes/" + period,
		success: function(d){
			// showMsg(JSON.stringify(d));
			$('#p1 .unusedVotes').html(d.unused_votes.toLocaleString());
			$('#p1 .unusedPercentage').html(Math.round((10000 * d.unused_votes) / d.total_votes)/100 + '%');
			resolve(d.total_votes);
		}
	  });
	});
}
function getBakerVotes(kind){
	/*$.ajax({
		type: "GET",
		url: "https://api.mytezosbaker.com/v1/bakers/",
		success: function(d){
			d.bakers.push({delegation_code: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt", baker_name: "Polychain Capital"});
			d.bakers.push({delegation_code: "tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB", baker_name: "gate.io"});*/
			var bakerList = mapOfPublicBakers;
			if (kind === "proposal") {
				//getAthensA(bakerList);
				//getAthensB(bakerList);
				latestVote(bakerList);
			} else if (kind === "testing_vote"|| kind === "promotion_vote") {
				latestBallotVotes(bakerList);
			}
	// }});
}
function latestBallotVotes(bakers) {
	$.ajax({
	type: "GET",
	url: "https://api6.tzscan.io/v3/operations?type=Ballot&p=0&number=10",
	success: function(d){
		for(var i = 0; i < d.length; i++){
			var name;
			if(d[i].type.source.alias){
				name = d[i].type.source.alias;
			} else {
				name = d[i].type.source.tz;
				for(var j = 0; j < bakers.length; j++){
					if(bakers[j].delegation_code == name){
						name = bakers[j].baker_name;
					}
				}
			}
			var proposal = d[i].type.ballot.toString();
			$("#p2 .RecentVotes").append("<tr><td id=\"recentVote" + i + "\">" + i + "</td><td>"+name+"</td><td>"+proposal+"</td></tr>");
			timeAgo(i, d[i].block_hash);
		}
	}});
}
function timeAgo(index, block_hash) {
	$.ajax({
	type: "GET",
	url: "https://api6.tzscan.io//v3/timestamp/" + block_hash,
	success: function(d){
		var blockTime = new Date(d);
		var timeNow = new Date();
		var timeDiff = timeNow - blockTime;
		var output = "";
		$("#recentVote" + index).html(timeDiff);
		if (timeDiff < 1000 * 60 * 60) { // less than 1 hour
			output = Math.round(timeDiff / (1000 * 60)) + " minutes"
		} else {
			output = Math.round(timeDiff / (1000 * 60 * 60)) + " hours"
		}
		$("#recentVote" + index).html(output);
	}});
		
}
function latestVote(bakers){
	$.ajax({
	type: "GET",
	url: "https://api6.tzscan.io/v3/operations?type=Proposal&p=0&number=10",
	success: function(d){
		var period = 0;
		if (d.length)
			period = d[0].type.period;
		for(var i = 0; i < d.length; i++){
			var name;
			if(d[i].type.source.alias){
				name = d[i].type.source.alias;
			} else {
				name = d[i].type.source.tz;
				for(var j = 0; j < bakers.length; j++){
					if(bakers[j].delegation_code == name){
						name = bakers[j].baker_name;
					}
				}
			}
			if (d[i].type.period === period) {
				var proposal = d[i].type.proposals.toString();
				proposal = proposal.replace("Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd", "Athens A");
				proposal = proposal.replace("Psd1ynUBhMZAeajwcZJAeq5NrxorM6UCU4GJqxZ7Bx2e9vUWB6z", "Athens B");
				$("#p1 .RecentVotes").append("<tr><td id=\"recentVote" + i + "\"></td><td>"+name+"</td><td>"+proposal+"</td></tr>");
				timeAgo(i, d[i].block_hash);
			}
		}
		
}});
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
function getAthensA(bakers){
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v1/proposal_votes/Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd?p=0&number=50",
		success: function(d){
			var prev = '';
			for(var i = 0; i < d.length; i++){
				var name;
				if (prev !== d[i].source.tz) {
					prev = d[i].source.tz;
					if(d[i].source.alias){
						name = d[i].source.alias;
					} else {
						name = d[i].source.tz;
						for(var j = 0; j < bakers.length; j++){
							if(bakers[j].delegation_code == name){
								name = bakers[j].baker_name;
							}
						}
					}
					$("#p2 .AthensA").append("<tr><td>"+name+"</td><td>"+d[i].ballot.toLocaleString()+"</td></tr>");
				}
			}
		}
  });
}
function getAthensB(bakers){
	$.ajax({
	type: "GET",
	url: "https://api6.tzscan.io/v1/proposal_votes/Psd1ynUBhMZAeajwcZJAeq5NrxorM6UCU4GJqxZ7Bx2e9vUWB6z?p=0&number=100",
	success: function(d){
		var prev = '';
		for(var i = 0; i < d.length; i++){
			var name;
				if (prev !== d[i].source.tz) {
					prev = d[i].source.tz;
					if(d[i].source.alias){
					name = d[i].source.alias;
				} else {
					name = d[i].source.tz;
					for(var j = 0; j < bakers.length; j++){
						if(bakers[j].delegation_code == name){
							name = bakers[j].baker_name;
						}
					}
				}
			$("#AthensB").append("<tr><td>"+name+"</td><td>"+d[i].votes.toLocaleString()+"</td></tr>");
				}
		}
	}
  });
}