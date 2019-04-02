var XY = [];
let Count = 0;
let Done = false;
let Period = 0;
$('document').ready(function(){
	// getPeriodInfo();
	getGraphData();
});
function showMsg(m){
  alert(m);
}
/*function getPeriodInfo(){
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v3/voting_period_info",
		success: function(d){
			// showMsg(JSON.stringify(d));
			var kind = d.kind;
			if (kind == "proposal") {
				$("#h1").addClass("active");
				$("#title").text("Proposal vote");
				$("#p1").css("display", "inline-block");
				setCountDown((d.period + 1) * 32768 - d.level);
				
				updateUnusedVotes(d.period);
				updateVotes();
				getBakerVotes(kind);
			} else if (kind == "testing_vote") {
				$("#h2").addClass("active");
				$("#title").text("Exploration vote");
				$("#p2").css("display", "inline-block");
				setCountDown((d.period + 1) * 32768 - d.level);
				ballot(d.period, kind);
				getBakerVotes(kind);
			}
			
	}});
}*/
/*function ballot(period, kind) {
	 $.ajax({
    type: "GET",
    url: "https://api6.tzscan.io/v3/ballots/" + period + "?period_kind=" + kind,
    success: function(d){
		// showMsg(JSON.stringify(d));
		// showMsg(JSON.stringify(d.vote_yay));
		 $('#p2 .a2').html(d.vote_yay.toLocaleString());
		 $('#p2 .b2').html(d.vote_nay.toLocaleString());
		 $('#p2 .c2').html(d.vote_pass.toLocaleString());
		 var total = d.vote_yay + d.vote_nay + d.vote_pass;
		 var yesPercentage = Math.round(10000*d.vote_yay/(d.vote_yay + d.vote_nay))/100;
		 $('#p2 .a3').html(Math.round(10000*d.vote_yay/total)/100+'%');
		 $('#p2 .b3').html(Math.round(10000*d.vote_nay/total)/100+'%');
		 $('#p2 .c3').html(Math.round(10000*d.vote_pass/total)/100+'%');
		 $('#p2 .g2').html(Math.round((d.vote_yay + d.vote_nay)*0.8).toLocaleString());
		 
		 $('#progress1 .progress-bar').css('width', yesPercentage+'%');
		 $('#progress1 .progress-bar').html(yesPercentage+'%');
		 if (yesPercentage > 80) {
			$('#progress1 .progress-bar').addClass("progress-bar-success");
		 } else if (yesPercentage > 40) {
			$('#progress1 .progress-bar').addClass("progress-bar-warning");
		 } else {
			$('#progress1 .progress-bar').addClass("progress-bar-danger");
		 }
		 totalVotes(period, total);
		 
    }
  });
}*/
/*function totalVotes(period, voted) {
	  $.ajax({
    type: "GET",
    url: "https://api6.tzscan.io/v3/total_voters/" + period,
    success: function(d){
		$('#p2 .d2').html(voted.toLocaleString());
		var votesPercentage = Math.round(10000*voted/(d.votes))/100;
		$('#p2 .d3').html(votesPercentage+'%');
		$('#p2 .e2').html((d.votes - voted).toLocaleString());
		$('#p2 .e3').html(Math.round(10000*(d.votes - voted)/(d.votes))/100+'%');
		$('#p2 .f2').html((d.votes * 0.8).toLocaleString());
		
		$('#progress2 .progress-bar').css('width', votesPercentage+'%');
		$('#progress2 .progress-bar').html(votesPercentage+'%');
		if (votesPercentage > 80) {
			$('#progress2 .progress-bar').addClass("progress-bar-success");
		 } else if (votesPercentage > 40) {
			$('#progress2 .progress-bar').addClass("progress-bar-warning");
		 } else {
			$('#progress2 .progress-bar').addClass("progress-bar-danger");
		 }
    }
  });
}*/


function getGraphData() {
	$.ajax({
		type: "GET",
		url: "https://mainnet-node.tzscan.io/chains/main/blocks/head/votes/listings",
		success: function(d){
			// showMsg(JSON.stringify(d[0]));
			let maxVotes = 0;
			for (var i = 0; i < d.length; i++) {
				maxVotes += d[i].rolls;
			}
			getHead(d, maxVotes);
		}
	});
}
function getHead(votingRights, maxVotes) {
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v3/head",
		success: function(d){
			XY.push([0, 'Pass', d.level]);
			Count = 1;
			getAllBallotVotes(votingRights, maxVotes, 0);
			
		}
	});
}
function getAllBallotVotes(votingRights, maxVotes, page) {
	const number = 50;
	$('#load').append('.');
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v3/operations?type=Ballot&p=" + page + "&number=" + number,
		success: function(d){
			// showMsg(JSON.stringify(d[0]));
			if (page === 0) {
				Period = d[0].type.period;
			}
			for(var i = 0; i < d.length; i++){
				for (var j = 0; j < votingRights.length; j++) {
					if (votingRights[j].pkh === d[i].type.source.tz) {
						XY.push([votingRights[j].rolls, d[i].type.ballot]);
						// showMsg(JSON.stringify(XY));
						addLevel(d[i].block_hash, XY.length - 1, maxVotes);
						break;
					}
				}
			}
			if (d.length === number && d[number - 1].type.period === Period) {
				getAllBallotVotes(votingRights, maxVotes, page + 1);
			} else {
				Done = true;
			}
		}
	});
}
function addLevel(block, index, maxVotes) {
	// showMsg(JSON.stringify(block));
	$.ajax({
		type: "GET",
		url: "https://api6.tzscan.io/v3/block/" + block,
		success: function(d){
			//showMsg(JSON.stringify(d.level));
			XY[index].push(d.level);
			Count += 1;
			// showMsg(JSON.stringify(XY));
			if (Count === XY.length && Done) {
				drawChart(XY, maxVotes);
			}
		}
	});
}
function drawChart(chartData, maxVotes) {
	$("#load").hide();
	let yTot = 0;
	let yYay = 0;
	let yNay = 0;
	var x1 = [];
	var y1 = [];
	var x2 = [];
	var y2 = [];
	var x3 = [];
	var y3 = [];
	const startBlock = chartData[0][2] - (chartData[0][2] % 32768);
	x3.push(0);
	y3.push(80);
	for (var i = chartData.length - 1; i >= 0; i--) {
		if (chartData[i].length === 3) {
			yTot = yTot + chartData[i][0];
			switch(chartData[i][1]) {
				case 'Yay':
				yYay += chartData[i][0];
				break;
				case 'Nay':
				yNay += chartData[i][0];
				break;
				default:
			}
			y1.push(Math.round((10000 * yTot)/maxVotes)/100);
			var xValue = Math.round(((chartData[i][2] - startBlock) * 10000) / 32768) / 100;
			x1.push(xValue);
			x2.push(xValue);
			x3.push(xValue);
			y3.push(80);
			y2.push(Math.round((10000 * yYay)/(yYay + yNay))/100);
		}
	}
	x3.push(100);
	y3.push(80);
	// 32768
	var trace1 = {
	  x: x1,
	  y: y1,
	  mode: 'lines',
	  name: 'Participation',
	  line: {
		  width: 3,
		  color: 'rgb(0, 0, 153)'
	  }
	};
	var trace2 = {
	  x: x2,
	  y: y2,
	  mode: 'lines',
	  yaxis: 'y2',
	  name: 'Acceptance',
	  line: {
		  width: 3,
		  color: 'rgb(0, 153, 0)'
	  }
	};
	var trace3 = {
	  x: x3,
	  y: y3,
	  mode: 'lines',
	  name: 'Quorum',
	  line: {
		dash: 'dot',
		width: 3,
		color: 'rgb(0, 0, 153)'
	  }
	};
	var trace4 = {
	  x: x3,
	  y: y3,
	  mode: 'lines',
	  yaxis: 'y2',
	  name: 'Supermajority',
	  line: {
		dash: 'dot',
		width: 3,
		color: 'rgb(0, 153, 0)'
	  }
	};
	var data = [trace2, trace4, trace1, trace3];
	  var result0 = {
		x: [x1[x1.length-1]],
		y: [y1[y1.length-1]],
		type: 'scatter',
		mode: 'markers',
		name: 'Currently',
		showlegend: false,
		hoverinfo: 'skip',
		marker: {
		  color: 'rgb(0, 0, 153)',
		  size: 7,
		}
	  };
	 var result00 = {
		x: [x2[x2.length-1]],
		y: [y2[y2.length-1]],
		type: 'scatter',
		mode: 'markers',
		yaxis: 'y2',
		name: 'Currently',
		showlegend: false,
		hoverinfo: 'skip',
		marker: {
		  color: 'rgb(0, 153, 0)',
		  size: 7
		}
	  };
	data.push(result0, result00);
	var layout = {
	  title: 'Exploration vote',
	  xaxis: {
		  domain: [0, 0.96],
		title: 'time (%)',
		tickmode: "linear",
		tick0: 0,
		dtick: 5
	  },
	  yaxis: {
		title: 'participation (%)',
		titlefont: {color: 'rgb(0, 0, 153)'},
		tickfont: {color: 'rgb(0, 0, 153)'},
		tickmode: "linear",
		tick0: 0,
		dtick: 5
	  },
	  yaxis2: {
		title: 'votes (%)',
		titlefont: {color: 'rgb(0, 153, 0)'},
		tickfont: {color: 'rgb(0, 153, 0)'},
		tickmode: "linear",
		tick0: 0,
		dtick: 5,
		anchor: 'x',
		overlaying: 'y',
		side: 'right'
	  },
	  annotations: []
	};
	var result1 = {
		xref: 'paper',
		x: (x1[x1.length-1]+0.5)/100,
		y: y1[y1.length-1],
		xanchor: 'left',
		yanchor: 'middle',
		text: y1[y1.length-1] +'%',
		font: {
		  family: 'Arial',
		  size: 16,
		  color: 'black'
		},
		bgcolor: '#FFFFFF',
		showarrow: false
	};
		var result2 = {
		xref: 'paper',
		x: (x2[x2.length-1] + 0.5)/100,
		y: y2[y2.length-1],
		yref: 'y2',
		xanchor: 'left',
		yanchor: 'middle',
		text: y2[y2.length-1] +'%',
		font: {
		  family: 'Arial',
		  size: 16,
		  color: 'black'
		},
		bgcolor: '#FFFFFF',
		showarrow: false
	};
	layout.annotations.push(result1, result2);
	Plotly.newPlot('chart', data, layout);
}