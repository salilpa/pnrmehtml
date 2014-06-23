// Install app
if (navigator.mozApps) {
	var checkIfInstalled = navigator.mozApps.getSelf();
	checkIfInstalled.onsuccess = function() {
		var install = document.querySelector("#install");
		if (checkIfInstalled.result) {
			install.style.display = "none";
		} else {
			var manifestURL = location.href.substring(0, location.href.lastIndexOf("/")) + "/package.manifest";
			var installButton = document.querySelector("#install-btn");
			installButton.onclick = function() {
				var installApp = navigator.mozApps.installPackage(manifestURL);
				installApp.onsuccess = function(data) {
					install.style.display = "none";
				};
				installApp.onerror = function() {
					alert("Install failed\n\n:" + installApp.error.name);
				};
			};
		}
	};
} else {
	console.log("Open Web Apps not supported");
}

// Reload content
var reload = document.querySelector("#reload");
if (reload) {
	reload.onclick = function() {
		location.reload(true);
	};
}