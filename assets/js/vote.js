$('document').ready(function(){
	updateVotes();
});
function showMsg(m){
  alert(m);
}
function updateVotes(){
  $.ajax({
    type: "GET",
    url: "https://rpc.tezrpc.me/chains/main/blocks/head/votes/proposals",
    success: function(d){
         $('#a1').html(d[1][0]);
		 $('#a2').html(d[1][1]);
		 $('#b1').html(d[0][0]);
		 $('#b2').html(d[0][1]);
    }
  });
}