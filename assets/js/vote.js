$('document').ready(function(){
	updateVotes();
	getBakerVotes();
});
function showMsg(m){
  alert(m);
}
function updateVotes(){
	var totalVotes = 51604;
  $.ajax({
    type: "GET",
    url: "https://rpc.tezrpc.me/chains/main/blocks/head/votes/proposals",
    success: function(d){
		 $('#a2').html(d[1][1]);
		 $('#b2').html(d[0][1]);
		 $('#a3').html(Math.round(10000*d[1][1]/(d[1][1]+d[0][1]))/100+'%');
		 $('#b3').html(Math.round(10000*d[0][1]/(d[1][1]+d[0][1]))/100+'%');
		 
		 $('#c2').html(totalVotes - d[0][1] - d[1][1])
    }
  });
}
function getBakerVotes(){
	$.ajax({
	type: "GET",
	url: "https://api.mytezosbaker.com/v1/bakers/",
	success: function(d){
		getAthensA(d.bakers);
		getAthensB(d.bakers);
	}});
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
					$("#AthensA").append("<tr><td>"+name+"</td><td>"+d[i].votes+"</td></tr>");
				} else {
					showMsg('dup');
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
			$("#AthensB").append("<tr><td>"+name+"</td><td>"+d[i].votes+"</td></tr>");
				} else {
					showMsg('dup');
				}
		}
	}
  });
}