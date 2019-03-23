$('document').ready(function(){
	getPeriodInfo();
});
function showMsg(m){
  alert(m);
}
function getPeriodInfo(){
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v3/voting_period_info",
		success: function(d){
			// showMsg(JSON.stringify(d));
			var kind = d.kind;
			if (kind == "proposal") {
				$("#h1").addClass("active");
				$("#title").text("Proposal vote");
				$("#p1").css("display", "inline-block");
				setCountDown((d.period + 1) * 32768 - d.level);
				
				updateUnusedVotes(d.period);
				updateVotes();
				getBakerVotes(kind);
			} else if (kind == "testing_vote") {
				$("#h2").addClass("active");
				$("#title").text("Exploration vote");
				$("#p2").css("display", "inline-block");
				setCountDown((d.period + 1) * 32768 - d.level);
				ballot(d.period, kind);
				getBakerVotes(kind);
			}
			
	}});
}
function ballot(period, kind) {
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
		 $('#p2 .a3').html(Math.round(10000*d.vote_yay/total)/100+'%');
		 $('#p2 .b3').html(Math.round(10000*d.vote_nay/total)/100+'%');
		 $('#p2 .c3').html(Math.round(10000*d.vote_pass/total)/100+'%');
		 $('#p2 .g2').html(Math.round(total*0.8).toLocaleString());
		 
		 $('#progress1 .progress-bar').css('width', yesPercentage+'%');
		 $('#progress1 .progress-bar').html(yesPercentage+'%');
		 if (yesPercentage > 80) {
			$('#progress1 .progress-bar').addClass("progress-bar-success");
		 } else if (yesPercentage > 40) {
			$('#progress1 .progress-bar').addClass("progress-bar-warning");
		 } else {
			$('#progress1 .progress-bar').addClass("progress-bar-danger");
		 }
		 totalVotes(period, total);
		 
    }
  });
}
function totalVotes(period, voted) {
	  $.ajax({
    type: "GET",
    url: "https://api6.tzscan.io/v3/total_voters/" + period,
    success: function(d){
		$('#p2 .d2').html(voted.toLocaleString());
		var votesPercentage = Math.round(10000*voted/(d.votes))/100;
		$('#p2 .d3').html(votesPercentage+'%');
		$('#p2 .e2').html((d.votes - voted).toLocaleString());
		$('#p2 .e3').html(Math.round(10000*(d.votes - voted)/(d.votes))/100+'%');
		$('#p2 .f2').html((d.votes * 0.8).toLocaleString());
		
		$('#progress2 .progress-bar').css('width', votesPercentage+'%');
		$('#progress2 .progress-bar').html(votesPercentage+'%');
		if (votesPercentage > 80) {
			$('#progress2 .progress-bar').addClass("progress-bar-success");
		 } else if (votesPercentage > 40) {
			$('#progress2 .progress-bar').addClass("progress-bar-warning");
		 } else {
			$('#progress2 .progress-bar').addClass("progress-bar-danger");
		 }
    }
  });
}
function updateVotes(){
  $.ajax({
    type: "GET",
    url: "https://rpc.tezrpc.me/chains/main/blocks/head/votes/proposals",
    success: function(d){
		 $('#p1 .a2').html(d[1][1].toLocaleString());
		 $('#p1 .b2').html(d[0][1].toLocaleString());
		 $('#p1 .a3').html(Math.round(10000*d[1][1]/(d[1][1]+d[0][1]))/100+'%');
		 $('#p1 .b3').html(Math.round(10000*d[0][1]/(d[1][1]+d[0][1]))/100+'%');
    }
  });
}
function updateUnusedVotes(period){
  $.ajax({
    type: "GET",
    url: "https://api6.tzscan.io/v3/total_proposal_votes/" + period,
    success: function(d){
		// showMsg(JSON.stringify(d));
		$('#p1 .c2').html(d.unused_votes.toLocaleString());
		$('#p1 .c3').html(Math.round((10000 * d.unused_votes) / d.total_votes)/100 + '%');
	}
  });
}
function getBakerVotes(kind){
	$.ajax({
	type: "GET",
	url: "https://api.mytezosbaker.com/v1/bakers/",
	success: function(d){
		d.bakers.push({delegation_code: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt", baker_name: "Polychain Capital"});
		d.bakers.push({delegation_code: "tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB", baker_name: "gate.io"});
		if (kind === "proposal") {
			getAthensA(d.bakers);
			getAthensB(d.bakers);
			latestVote(d.bakers);
		} else if (kind === "testing_vote") {
			latestTestingVotes(d.bakers);
		}
	}});
}
function latestTestingVotes(bakers) {
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
			$("#p2 .RecentVotes").append("<tr><td>"+name+"</td><td>"+proposal+"</td></tr>");
		}
		
	}});
}
function latestVote(bakers){
	$.ajax({
	type: "GET",
	url: "https://api6.tzscan.io/v3/operations?type=Proposal&p=0&number=5",
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
			var proposal = d[i].type.proposals.toString();
			proposal = proposal.replace("Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd", "Athens A");
			proposal = proposal.replace("Psd1ynUBhMZAeajwcZJAeq5NrxorM6UCU4GJqxZ7Bx2e9vUWB6z", "Athens B");
			$("#1 .RecentVotes").append("<tr><td>"+name+"</td><td>"+proposal+"</td></tr>");
		}
		
}});
}
function setCountDown(blocks){
	var minutes = blocks % 60;
	var hours = (blocks - minutes) / 60;
	var days = (hours - hours % 24) / 24;
	hours = hours % 24;
	if (days === 0) {
		$("#countDown").html(hours + " hours " + minutes + "minutes");
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