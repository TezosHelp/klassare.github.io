var rcount = 0, total = 0;
$('document').ready(function(){
  updateTable();
  $('#loadMore').click(function(){
    updateTable();
  });
  $('#sendPetition').click(function(){
    var name = $('#name').val(),
    organization = $('#organization').val(),
    role = $('#role').val();
    if (!name) {
      showMsg("Please enter your name");
      return;
    }
    if (!role) {
      showMsg("Please enter your name");
      return;
    }
    if (name.length > 128 || organization.length > 128 || role.length > 128) {
      showMsg("Please ensure all fields are less than 128 characters long");
      return;
    }
    $.ajax({
      type: "POST",
      url: "https://tezrpc.me/api/extended/petitionAdd",
      data: {
        name : name,
        organization : organization,
        role : role,
      },
      success: function(d){
          if (d.success){
            clearFields();
            showMsg("Thank you for completing our petition!");
            total = d.data.total;
            console.log(d);
            buildTable(d.data.records);
          } else {
            showMsg(d.error);
          }
      }
    });
  });
});
function showMsg(m){
  alert(m);
}
function clearFields(){
  $('#name').val('');
  $('#organization').val('');
  $('#role').val('');
}
function updateTable(){
  $.ajax({
    type: "POST",
    url: "https://tezrpc.me/api/extended/petitionList",
    data: {
      start : rcount,
    },
    success: function(d){
        if (d.success){
          console.log(d);
          total = d.data.total;
          buildTable(d.data.records);
        } else {
          showMsg(d.error);
        }
    }
  });
}
function buildTable(d){
  if (!d.length) return;
  rcount += d.length;
  if (rcount >= total){
    $('#loadMore').hide();
  } else {
    $('#loadMore').show();
  }
  console.log(d);
  for(var i = 0; i < d.length; i++){
    $("#petitionList").append("<tr><td>"+encodeHTML(d[i].name)+"</td><td>"+encodeHTML(d[i].organization)+"</td><td>"+encodeHTML(d[i].role)+"</td></tr>");
  }
}
function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
function swapLanguage(){
	$('[lang="eng"]').toggle();
	$('[lang="ger"]').toggle();
	return false;
}