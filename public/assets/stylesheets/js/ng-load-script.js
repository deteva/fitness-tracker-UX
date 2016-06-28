//       <!-- hide except chrome browser -->
if(navigator.userAgent.indexOf("Chrome") === -1 ) {
	console.log(navigator.userAgent);
	var txtDiv=document.createElement('div');
	txtDiv.id= "desc";
	document.body.appendChild(txtDiv);
	document.getElementById("desc").innerHTML="건강한 습관을 만들어주는 " +
		"대시보드 " +
		"디자인은, " +
		"chrome에서 보기를 추천합니다.";
//            debugger;
} else {
	console.log('chrome');
	console.log(navigator.userAgent);
	var script = document.createElement("script");
	//script.type = 'text/javascript';
	script.src = '/app/components/body-shape/body-shape.drct.js';
	var script2 = document.createElement("script");
	//script2.type = 'text/javascript';
	script2.src = '/app/components/number-today/number-today.drct.js';
	var script3 = document.createElement("script");
	//script3.type = 'text/javascript';
	script3.src = '/app/components/feedback/feedback.drct.js';
	document.body.appendChild(script);
	document.body.appendChild(script2);
	document.body.appendChild(script3);
}
