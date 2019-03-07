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
	getAthensA();
	getAthensB();
}
function getAthensA(){
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v1/proposal_votes/Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd?p=0&number=100",
		success: function(d){
			for(var i = 0; i < d.length; i++){
				var name;
				if(d[i].source.alias){
					name = d[i].source.alias;
				} else {
					name = d[i].source.tz;
				}
				$("#AthensA").append("<tr><td>"+name+"</td><td>"+d[i].votes+"</td></tr>");
			}
		}
  });
}
function getAthensB(){
	$.ajax({
	type: "GET",
	url: "https://api6.tzscan.io/v1/proposal_votes/Psd1ynUBhMZAeajwcZJAeq5NrxorM6UCU4GJqxZ7Bx2e9vUWB6z?p=0&number=100",
	success: function(d){
		for(var i = 0; i < d.length; i++){
			var name;
				if(d[i].source.alias){
					name = d[i].source.alias;
				} else {
					name = d[i].source.tz;
				}
			$("#AthensB").append("<tr><td>"+name+"</td><td>"+d[i].votes+"</td></tr>");
		}
	}
  });
}