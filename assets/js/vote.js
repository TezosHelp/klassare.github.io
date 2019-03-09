$('document').ready(function(){
	getPeriodInfo();
	updateVotes();
	getBakerVotes();
});
function showMsg(m){
  alert(m);
}
function updateVotes(){
  $.ajax({
    type: "GET",
    url: "https://rpc.tezrpc.me/chains/main/blocks/head/votes/proposals",
    success: function(d){
		 $('#a2').html(d[1][1].toLocaleString());
		 $('#b2').html(d[0][1].toLocaleString());
		 $('#a3').html(Math.round(10000*d[1][1]/(d[1][1]+d[0][1]))/100+'%');
		 $('#b3').html(Math.round(10000*d[0][1]/(d[1][1]+d[0][1]))/100+'%');
    }
  });
}
function updateUnusedVotes(period){
  $.ajax({
    type: "GET",
    url: "https://api6.tzscan.io/v3/total_proposal_votes/" + period,
    success: function(d){
		// showMsg(JSON.stringify(d));
		$('#c2').html(d.unused_votes.toLocaleString());
		$('#c3').html(Math.round((10000 * d.unused_votes) / d.total_votes)/100 + '%');
	}
  });
}
function getBakerVotes(){
	$.ajax({
	type: "GET",
	url: "https://api.mytezosbaker.com/v1/bakers/",
	success: function(d){
		d.bakers.push({delegation_code: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt", baker_name: "Polychain Capital"});
		d.bakers.push({delegation_code: "tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB", baker_name: "gate.io"});
		getAthensA(d.bakers);
		getAthensB(d.bakers);
	}});
}
function getPeriodInfo(){
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v3/voting_period_info",
		success: function(d){
			// showMsg(JSON.stringify(d));
			setCountDown((d.period + 1) * 32768 - d.level);
			updateUnusedVotes(d.period);
			
	}});
}
function setCountDown(blocks){
	var minutes = blocks % 60;
	var hours = (blocks - minutes) / 60;
	var days = (hours - hours % 60) / 24;
	hours = hours % 60;
	if (days === 0) {
		$("#countDown").html(hours + " hours " + minutes + "minutes");
	} else {
		$("#countDown").html(days + " days " + hours + " hours");
	}
}
function getAthensA(bakers){
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v1/proposal_votes/Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd?p=0&number=100",
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
					$("#AthensA").append("<tr><td>"+name+"</td><td>"+d[i].votes.toLocaleString()+"</td></tr>");
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