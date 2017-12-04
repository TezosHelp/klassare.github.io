var rcount = 0, total = 0;
$('document').ready(function(){
  updateTable();
  $('#loadMore').click(function(){
    updateTable();
  });
  $('.sendPetition').click(function(){
    var c = (eng ? 'eng' : 'ger');
    var name = $('[name=name].'+c).val(),
    organization = $('[name=organization].'+c).val(),
    role = $('[name=role].'+c).val();
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
            if (rcount == (total -1)){
              buildTable(d.data.records);                            
            }
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
  $('[name=name]').val('');
  $('[name=organization]').val('');
  $('[name=role]').val('');
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
  $('#petitionCount').html(numberWithCommas(total));
  for(var i = 0; i < d.length; i++){
    $("#petitionList").append("<tr><td>"+encodeHTML(d[i].name)+"</td><td>"+encodeHTML(d[i].organization)+"</td><td>"+encodeHTML(d[i].role)+"</td></tr>");
  }
}
function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}
function setLangEng(){
    $('#loadMore').val('Load More');
	$('[lang="ger"]').hide();
	$('[lang="fra"]').hide();
	$('[lang="eng"]').show();
	return false;
}
function setLangGer(){
    $('#loadMore').val('Mehr laden');
	$('[lang="eng"]').hide();
	$('[lang="fra"]').hide();
	$('[lang="ger"]').show();
	return false;
}
function setLangFra(){
    $('#loadMore').val('Charger plus');
	$('[lang="eng"]').hide();
	$('[lang="ger"]').hide();
	$('[lang="fra"]').show();
	return false;
}