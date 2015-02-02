// Gist retrieval & display

var total, savedTotal;

function getGists() {
	total=0;
	var pages = document.getElementById("pages").value;
	document.getElementById("left").innerHTML="<h3>Search Results</h3><p id='status'></p>";
	
	if(pages<1){
		alert("1 page is the minimum allowed query. Showing 1 page of results.");
		pages=1;
	}
	if(pages>5){
		alert("5 pages is the maximum allowed query. Only showing 5 pages of results.");
		pages=5;
	}
	
	for (var i=1; i<= pages; i++){
		var req = new XMLHttpRequest();
		if (!req) {
			throw 'Could not create new HttpRequest.';
		}
		
		var url = "https://api.github.com/gists?page="+i;
		var status = document.getElementById("status");
		req.onreadystatechange = function() {
			if(this.readyState < 4) {
				status.textContent="Fetching results...";
			}
			if(this.readyState === 4) {
				status.textContent="";
				var res = JSON.parse(this.responseText);
				filterResults(res);
				total = showGists(res, total);
				document.getElementById("status").textContent="Total number of results: " + total;
			}
		}

		req.open('GET', url);
		req.send();
	}
}

function filterResults(res){
	var langs = document.getElementsByName("lang");
	filter = [];

	for (var i in langs){
		if(langs[i].checked){
			filter.push(langs[i].value);
		}
	}

	if (filter.length < 1){
		return;
	}
	else{
		for (var i in res){
			var filtered = true;
			for (var f in res[i].files){
				if (filter.indexOf(res[i].files[f].language)>-1){
					filtered = false;
					break;
				}
			}
			res[i]["filtered"] = filtered;
		}
	}
}

function showGists(res, total) {
	var results = document.getElementById("left");
	for (var gist in res){
		var id=res[gist].id;
		if(!res[gist].filtered && gistFaves.ids.indexOf(id)<0){
			total++;
			var br = document.createElement("br");
			var div = document.createElement("div");
			var link = document.createElement("a");
			var gistID = document.createElement("p");
			gistID.className="gistID";
			gistID.textContent="Gist ID: " + res[gist].id;
			var faveButton = document.createElement("input");
			faveButton.type="button";
			faveButton.value="Save this gist";
			faveButton.setAttribute('onClick', 'saveFave("'+id+'")');
			var lang="Languages: ";
			for (i in res[gist].files) {
				if (!res[gist].files[i].language){
					lang+= "Undefined, ";
				}
				else{
					lang+= res[gist].files[i].language+", ";
				}
			}
			lang = lang.slice(0, -2);
			var langs = document.createElement('p');
			langs.className="langs";
			langs.textContent=lang;
			link.setAttribute("href", res[gist].html_url);
			if (!res[gist].description){
				link.textContent = "No Description";
			}
			else {
				link.textContent = res[gist].description;
			}



			div.className="gist";
			div.id=res[gist].id;
			div.appendChild(gistID);
			div.appendChild(langs);
			div.appendChild(link);
			div.appendChild(br);
			div.appendChild(faveButton);
			results.appendChild(div);
		}
	}
	return total;
}

function showSavedGists(res, total) {
	var results = document.getElementById("right");
	for (var gist in res){
		total++;
		var id=res[gist].id;
		var br = document.createElement("br");
		var div = document.createElement("div");
		var link = document.createElement("a");
		var gistID = document.createElement("p");
		gistID.className="gistID";
		gistID.textContent="Gist ID: " + res[gist].id;
		var faveButton = document.createElement("input");
		faveButton.type="button";
		faveButton.value="Delete saved gist";
		faveButton.setAttribute('onClick', 'deleteFave("'+id+'")');
		var lang=res[gist].langs;
		var langs = document.createElement('p');
		langs.className="langs";
		langs.textContent=lang;
		link.setAttribute("href", res[gist].html_url);
		link.textContent = res[gist].desc;

		div.className="gist";
		div.id=res[gist].id;
		div.appendChild(gistID);
		div.appendChild(langs);
		div.appendChild(link);
		div.appendChild(br);
		div.appendChild(faveButton);
		results.appendChild(div);
	}
	return total;
}


// Localstorage & saving favorites
var gistFaves = null;

window.onload = function() {
	total=savedTotal=0;
	gistFaves = localStorage.getItem('savedFaves');
	if(!gistFaves){
		gistFaves={'gists':[], 'ids':[]};
		localStorage.setItem('savedFaves', JSON.stringify(gistFaves));
	}
	else {
		gistFaves= JSON.parse(localStorage.getItem('savedFaves'));
	}
	savedTotal = showSavedGists(gistFaves.gists, savedTotal);
	document.getElementById("savedTotal").textContent="Total number of saved gists: " + savedTotal;
	document.getElementById("status").textContent="Total number of results: " + total;
}

function saveFave(id){
	var newSave = {};
	var div=document.getElementById(id);
	var saveds=document.getElementById("right");
	saveds.appendChild(div);
	var button = div.getElementsByTagName("input");
	button[0].value="Delete saved gist";
	button[0].setAttribute('onClick', 'deleteFave("'+id+'")');

	newSave['id'] = id;
	var gistID = div.getElementsByClassName('gistID');
	var langs = div.getElementsByClassName('langs');
	var desc  = div.getElementsByTagName('a');
	newSave['id'] = id;
	newSave['gistID'] = gistID[0].textContent;
	newSave['langs'] = langs[0].textContent;
	newSave['desc'] = desc[0].textContent;
	newSave['html_url'] = desc[0].getAttribute('href');

	gistFaves.ids.push(id);
	gistFaves.gists.push(newSave);
	savedTotal++;
	total--;
	document.getElementById("savedTotal").textContent="Total number of saved gists: " + savedTotal;
	document.getElementById("status").textContent="Total number of results: " + total;

	localStorage.setItem('savedFaves', JSON.stringify(gistFaves));
}

function deleteFave(id){
	gistFaves.ids.splice(gistFaves.ids.indexOf(id), 1);
	for(i in gistFaves.gists){
		if(gistFaves.gists[i].id === id){
			break;
		}
	}
	gistFaves.gists.splice(i, 1);

	var child = document.getElementById(id);
	var parent = document.getElementById("right");
	parent.removeChild(child);
	savedTotal--;
	document.getElementById("savedTotal").textContent="Total number of saved gists: " + savedTotal;
	
	localStorage.setItem('savedFaves', JSON.stringify(gistFaves));
	
}
