window.onload = function(){
	//mainView();
}
mainView = function(){
	get('container2').style.display = 'none';
	get('container1').style.display = 'block';
	window.scrollTo(0, 0);
}
mainViewDown = function(){
	get('container2').style.display = 'none';
	get('container1').style.display = 'block';
	window.scrollTo(0,document.body.scrollHeight);
}
contactView = function(){
	resetForm();
	get('container1').style.display = 'none';
	get('container2').style.display = 'block';
	window.scrollTo(0, 0);
}
function resetForm(){
	get('name').value = "";
	get('email').value = "";
	get('message').value = "";
	get('category').selectedIndex = 0;
}
function resetForm2(){
	get('name2').value = "";
	get('question').value = "";
}
function setContactView(){
	contactView();
	return false;
}
function setMainView(){
	mainViewDown();
	return false;
}
function setMainViewUp(){
	mainView();
	return false;
}
	//Help functions general
function get(id){
	return document.getElementById(id);
}
function echo(msg){
	window.alert(msg);
}