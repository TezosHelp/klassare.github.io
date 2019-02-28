$('document').ready(function(){
	updateVotes();
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
         $('#a1').html(d[1][0]);
		 $('#a2').html(d[1][1]);
		 $('#b1').html(d[0][0]);
		 $('#b2').html(d[0][1]);
		 $('#c2').html(totalVotes - d[0][1] - d[1][1])
		 $('#d2').html(totalVotes)
    }
  });
}