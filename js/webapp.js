PredictorRequest = function(options) {
    this.predict = options.predict;
	this.url = this.predict == true ? 'http://pnr.me/restPredictor/' : 'http://pnr.me/restStatus/';
	this.pnr = options.pnr ? options.pnr : '1234567890';
	this.response = null;

	this.getURL = function(){
		if (this.pnr != null){
			return this.url + this.pnr;
		}else {
			throw new Error("Incorrect Request");
		}
	};

	this.call = function(){
		apiRequest(this);
	};
};


function apiRequest(request){
	var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open("GET", request.getURL(), true);
    xhr.onreadystatechange = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
        	console.log("Got response for " + request.getURL());
        	request.response = JSON.parse(xhr.response);
        }
    };

    xhr.onerror = function () {
    	alert("Failed to reach pnr.me API server");
    };
    
    xhr.send();
}

function renderResponse(predictionResult){
	$('#accordion').html('');
	$('#results-container').html('');
	
	renderPrediction(predictionResult);
}

function renderProgressBar(time){
	// time is a number between 0 and 20
	var percentage = time * 100 / 20;
	var html = '';
	if (time >= 0 && time < 6){
		// normal
		html += '<div class="bar bar-success" style="width: ' + percentage + '%;"></div>';
	}else if (time >= 6 && time < 16){
		// warning
		percentage = percentage - 25;
		html += '<div class="bar bar-success" style="width: 25%;"></div>';
		html += '<div class="bar bar-warning" style="width: ' + percentage + '%;"></div>';
	}else if (time >= 16){
		//danger
		percentage = percentage - 80;
		html += '<div class="bar bar-success" style="width: 25%;"></div>';
		html += '<div class="bar bar-warning" style="width: 55%;"></div>';
		html += '<div class="bar bar-danger" style="width: ' + percentage + '%;"></div>';
	}
	
	$('#progress').html(html).show();
}

function renderPrediction(request){
    var message = '';
    if (request.response.status == 'error'){
        message = '<div class="alert alert-error">' + request.response.message[0] + '</div>';
    } else if (request.predict){
        message += '<div class="alert alert-success">';
        for (var i= 0; i < request.response.message.length; i++){
            message += request.response.message[i][0] + ' : ' + request.response.message[i][1] + '<br>';
        }
        message += '</div>';
    } else{
        message += '<div><table class="table table-bordered table-striped"><thead>';
        message += '<tr><th>no</th><th>booking</th><th>current</th></tr></thead><tbody>';
        for (var i= 0; i < request.response.message.passenger_status.length; i++){
            message += '<tr><td>'+ i+1 + '</td><td>' + request.response.message.passenger_status[i].booking_status + '</td><td>' + request.response.message.passenger_status[i].current_status + '</td></tr>';
        }
        message += '</tbody></table><table class="table table-bordered table-striped"><tbody>';
        message += '<tr><td>from</td><td>' + request.response.message.from + '</td></tr>';
        message += '<tr><td>to</td><td>' + request.response.message.to + '</td></tr>';
        message += '<tr><td>class</td><td>' + request.response.message.class + '</td></tr>';
        message += '<tr><td>train number</td><td>' + request.response.message.train_number + '</td></tr>';
        message += '<tr><td>train name</td><td>' + request.response.message.train_name + '</td></tr>';
        message += '<tr><td>boarding date</td><td>' + request.response.message.boarding_date + '</td></tr>';
        message += '<tr><td>boarding point</td><td>' + request.response.message.boarding_point + '</td></tr>';
        message += '<tr><td>reserved up to</td><td>' + request.response.message.reserved_upto + '</td></tr>';
        message += '</tbody></table>';
        message += '</div>';
    }
	var html = '';
	html += message;
	$('#results-container').html(html);
}

function getData(options){
    var predictRequest = new PredictorRequest(options);
    predictRequest.call();

    var tries = 0;
    var intervalID = window.setInterval(function(){
        if (predictRequest.response != null){
            console.log("Got the responses");
            try{
                renderResponse(predictRequest);
            }catch(err){
                alert("Woops. Something failed. Try again later.");
                console.log(err);
            }finally{
                window.clearInterval(intervalID);
                $('#progress').hide();
            }
        }else if ( tries === 20){
            $('#progress').hide();
            alert("Failed to reach pnr.me API server after 20 seconds");
            window.clearInterval(intervalID);
        }else{
            console.log("Checking for response try " + tries);
            tries++;
            renderProgressBar(tries);
        }
    }, 1000);
}



(function() {
	// set a global var with the last request date
	// with this we can check when to call the API again

    $('#status-button').click(function(){
        var pnr = $('#pnr-number').val();
        getData({'pnr': pnr, 'predict': false});
    });
	$('#predict-button').click(function(){
        var pnr = $('#pnr-number').val();
        getData({'pnr': pnr, 'predict': true});
	});

})();
