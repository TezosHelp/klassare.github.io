var rcount = 0, total = 0;
$('document').ready(function(){
  //updateTable();
  $('#loadMore').show();
  $('#loadMore').click(function(){
    showMsg("Server currently not available due to database maintenance. Please come back later.");
  });
  $('.sendPetition').click(function(){
	showMsg("Server currently not available due to database maintenance. Please come back later.");
    clearFields();
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
var lang = 'eng';
function setLangEng(){
	$('[class="active_lang"]').removeClass("active_lang");
	$('#navEng').addClass("active_lang");
    $('#loadMore').val('Load More');
	$('[lang="ger"]').hide();
	$('[lang="fra"]').hide();
	$('[lang="rus"]').hide();
	$('[lang="eng"]').show();
	lang = 'eng';
	return false;
}
function setLangGer(){
	$('[class="active_lang"]').removeClass("active_lang");
	$('#navGer').addClass("active_lang");
    $('#loadMore').val('Mehr laden');
	$('[lang="eng"]').hide();
	$('[lang="fra"]').hide();
	$('[lang="rus"]').hide();
	$('[lang="ger"]').show();
	lang = 'ger';
	return false;
}
function setLangFra(){
	$('[class="active_lang"]').removeClass("active_lang");
	$('#navFra').addClass("active_lang");
    $('#loadMore').val('Charger plus');
	$('[lang="eng"]').hide();
	$('[lang="ger"]').hide();
	$('[lang="rus"]').hide();
	$('[lang="fra"]').show();
	lang = 'fra';
	return false;
}
function setLangRus(){
	$('[class="active_lang"]').removeClass("active_lang");
	$('#navRus').addClass("active_lang");
    $('#loadMore').val('ЗАГРУЗИТЬ ЕЩЁ');
	$('[lang="eng"]').hide();
	$('[lang="ger"]').hide();
	$('[lang="fra"]').hide();
	$('[lang="rus"]').show();
	lang = 'rus';
	return false;
}