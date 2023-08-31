var log_records = [];  // Array of log records returned to Flask

var reviewRemarks = {};

$(window).on("load", function(){

    $("#review-completed").click(function () {
        logData("pageClosed", "pageClosed");
		logData("hiddenCommitDec", document.getElementById("hiddenCommitDec").value);

        var data = {
            'data': log_records
        }
        var myData = JSON.stringify(data);

        $("#hidden_log").val(myData);
    });
});


function initMergely(elementId, height, contextHeight, width, lineNumberLeft, contentLeft, lineNumberRight, contentRight, prefixLineCount, prefix, suffix,
	comment_user, codesugg_user, comment, comment_lineNumber, sub_lineNumber, add_lineNumber, total_lineNumber, code_suggestion_L, code_suggestion_R) {
	$(elementId).mergely({
		width: width,
		height: height,
		wrap_lines: true,
		fadein: '',
		cmsettings: { 
			readOnly: true, 
			//mode: "python", 
			mode: {name: "python",
			version: 3,
			singleLineStringErrors: false},
			autoresize: true, 
			lineWrapping: true, 
			gutters: ["remarks", "CodeMirror-linenumbers"]},
		lhs: function(setValue) {
			setValue(contentLeft);
		},
		rhs: function(setValue) {
			setValue(contentRight);
		},
		loaded: function() {
			var el = $(elementId);
			var editor_left = el.mergely('cm', 'lhs');
			var editor_right = el.mergely('cm', 'rhs');
			editor_left.options.firstLineNumber = lineNumberLeft;
			editor_right.options.firstLineNumber = lineNumberRight;
			if (code_suggestion_L != "") {
				editor_left.options.elementId = elementId;
				editor_left.options.user = comment_user;
				editor_left.options.codesugg_user = codesugg_user;
				editor_left.options.comment = comment;
				editor_left.options.code_suggestion = code_suggestion_L;
				editor_left.options.comment_lineNumber = comment_lineNumber;
				editor_left.options.sub_lineNumber = sub_lineNumber;
				editor_left.options.add_lineNumber = add_lineNumber;
				editor_left.options.total_lineNumber = total_lineNumber;
				editor_left.on("change", openCommentBox);
			}
			if (code_suggestion_R != ""){
				editor_right.options.elementId = elementId;
				editor_right.options.user = comment_user;
				editor_right.options.codesugg_user = codesugg_user;
				editor_right.options.comment = comment;
				editor_right.options.code_suggestion = code_suggestion_R;
				editor_right.options.comment_lineNumber = comment_lineNumber;
				editor_right.options.add_lineNumber = add_lineNumber;
				editor_right.options.sub_lineNumber = sub_lineNumber;
				editor_right.options.total_lineNumber = total_lineNumber;
				editor_right.on("change", openCommentBox);
			}
			editor_right.on("gutterClick", handleGutterClick);
			editor_left.hunkId = elementId.replace('#compare', '');
			editor_right.hunkId = elementId.replace('#compare', '');
			editor_left.hunkSide = 0;
			editor_right.hunkSide = 1;
			//store prefix/suffix settings only on the left side
			editor_left.ps_height = contextHeight;
			editor_left.ps_linecount = prefixLineCount;
			editor_left.ps_prefix = prefix;
			editor_left.ps_lhs = contentLeft;
			editor_left.ps_rhs = contentRight;
			editor_left.ps_suffix = suffix;
			editor_left.ps_prefixActive = false;
		}
	});
}


function logData(action, data){
    // console.log(`${new Date().getTime()};${action};${data}\n`)
    log_records.push(`${new Date().getTime()};${action};${data}\n`);
}

function makeMarker(msg){
	var marker = document.createElement("div");
	var icon = marker.appendChild(document.createElement("span"));
	icon.innerHTML = "!!";
	icon.className = "lint-error-icon";
	var name = marker.appendChild(document.createElement("span"))
	name.innerHTML = "<b>Alice: </b>";
	marker.appendChild(document.createTextNode(msg));
	marker.className = "lint-error";

	// Add a line break after the buttons
	marker.appendChild(document.createElement("br"));
	marker.appendChild(document.createElement("br"));

	return marker;
}

function makeTextArea(user, user_comment, codesugg_user, elementId){
	var marker = document.createElement("div");
	marker.id = "outerBox";
	marker.style.border = "1px solid grey";
	marker.style.borderRadius = "8px";
	marker.style.padding = "5px";
	marker.style.margin = "15px";
	marker.style.backgroundColor = "white";

	//header -- user review comment
	var headerdiv = document.createElement("div");
	headerdiv.id = "commentUser";
	var img = headerdiv.appendChild(document.createElement("img"));
	if(user == "Alice"){
		img.src = "/static/human_avatar.png";
	}else if(user == "Bot"){
		img.src = "/static/bot_avatar.png";
	}
	img.alt = "User Avatar";
	img.className = "avatar";
	img.style.width = "30px";
	img.style.height = "30px";
	img.style.borderRadius = "55%";
	var username = headerdiv.appendChild(document.createElement("span"));
	username.innerHTML = user;
	username.style.fontWeight = "bold";
	username.style.marginLeft = "15px";
	username.style.fontSize = "16px";
	username.style.fontFamily = "Helvetica";
	var timestamp = headerdiv.appendChild(document.createElement("span"));
	timestamp.innerHTML = "20 mins ago";
	timestamp.style.fontSize = "12px";
	timestamp.style.color = "grey";
	timestamp.style.marginLeft = "10px";
	headerdiv.style.display = "flex";
	headerdiv.style.alignItems = "center";
	marker.appendChild(headerdiv);

	marker.appendChild(document.createElement("br"));
	var comment = marker.appendChild(document.createElement("span"));
	comment.innerHTML = user_comment;
	comment.style.fontSize = "15px";
	comment.style.fontFamily = "Arial";

	marker.appendChild(document.createElement("br"));
	marker.appendChild(document.createElement("br"));
	marker.appendChild(document.createElement("br"));

	//header -- user code suggestion
	var headerdiv_sugg = document.createElement("div");
	headerdiv_sugg.id = "innerBox"
	var img1 = headerdiv_sugg.appendChild(document.createElement("img"));
	logData("codesugg_user", codesugg_user);
	if(codesugg_user == "Alice"){
		img1.src = "/static/human_avatar.png";
	}else if(codesugg_user == "Bot"){
		img1.src = "/static/bot_avatar.png";
	}
	img1.alt = "User Avatar";
	img1.className = "avatar";
	img1.style.width = "30px";
	img1.style.height = "30px";
	img1.style.borderRadius = "55%";
	var username = headerdiv_sugg.appendChild(document.createElement("span"));
	username.className = "username";
	username.innerHTML = codesugg_user;
	username.style.fontWeight = "bold";
	username.style.marginLeft = "15px";
	username.style.fontSize = "16px";
	username.style.fontFamily = "Helvetica";
	var timestamp1 = headerdiv_sugg.appendChild(document.createElement("span"));
	timestamp1.innerHTML = "20 mins ago";
	timestamp1.style.fontSize = "12px";
	timestamp1.style.color = "grey";
	timestamp1.style.marginLeft = "10px";
	headerdiv_sugg.style.display = "flex";
	headerdiv_sugg.style.alignItems = "center";
	marker.appendChild(headerdiv_sugg);
	//marker.appendChild(document.createElement("br"));

	var messageDiv = marker.appendChild(document.createElement("div"));
	var list = document.createElement("ul");
	list.style.listStyleType = "none";
	list.style.padding = "0";
	list.style.margin = "10px 20px";
	list.style.border = "1px solid grey";
	list.style.borderRadius = "5px";
	var item1 = list.appendChild(document.createElement("li"));
	item1.style.borderBottom = "1px solid grey";
	item1.style.padding = "5px";
	var icon = item1.appendChild(document.createElement("span"));
	icon.innerHTML = "Suggested changes";
	icon.style.fontSize = "14px";
	icon.style.color = "grey";
	icon.style.padding= "8px 16px";
	icon.style.fontFamily = "Noto sans-serif";
	var item2 = list.appendChild(document.createElement("li"));
	var textArea = item2.appendChild(document.createElement("textarea"));
	textArea.id = "codeEditor"+elementId;
	textArea.style.resize = "none";
	item2.style.borderBottom = "1px solid grey";
	var item3 = list.appendChild(document.createElement("li"));
	item3.style.padding = "5px";
	item3.style.textAlign = "right";
	
	var commitText = item3.appendChild(document.createElement("textarea")); //hidden textarea for seeting commit decision
	commitText.id = "hiddenCommitDec";
	commitText.style.display="none";

	var button1 = item3.appendChild(document.createElement("button"));
	button1.type="button";
	button1.innerHTML = "Commit Changes";
	button1.id="commit";
	button1.style.borderRadius= "5px";
	button1.style.backgroundColor= "#e7e7e7";
    button1.style.color= "black";
    button1.style.fontSize= "14px";
	button1.style.border = "1px solid grey";
	marker.appendChild(list);

	button1.onclick = function(){
		if (button1.innerHTML == "Commit Changes"){
			logData("commit changes", "yes");
			button1.innerHTML = "Undo Commit";
			messageDiv.innerHTML = "Changes Committed";
			messageDiv.style.color = "green";
			messageDiv.style.fontSize = "14px";
			messageDiv.style.fontStyle = "bold";
			messageDiv.style.fontFamily = "Noto sans-serif";
			document.getElementById("hiddenCommitDec").value = "committed";
		}else if (button1.innerHTML == "Undo Commit"){
			logData("undo commit", "yes");
			button1.innerHTML = "Commit Changes";
			messageDiv.innerHTML = "Changes Reverted";
			messageDiv.style.color = "red";
			messageDiv.style.fontSize = "14px";
			messageDiv.style.fontStyle = "bold";
			messageDiv.style.fontFamily = "Noto sans-serif";
			document.getElementById("hiddenCommitDec").value = "";
		}
	}

	var user_reply = document.createElement("div");
	user_reply.style.marginBottom = "10px";
	user_reply.style.backgroundColor = "#F5F5F5"
	// user_reply.style.marginLeft = "-5px";
	// user_reply.style.marginRight = "-5px";
	user_reply.style.alignItems = "center";
	user_reply.style.display = "flex";
	var img2= user_reply.appendChild(document.createElement("img"));
	img2.src = "/static/neutral_avatar.png";
	img2.alt = "User Avatar";
	img2.className = "avatar";
	img2.style.width = "30px";
	img2.style.height = "30px";
	img2.style.borderRadius = "55%";
	var username = user_reply.appendChild(document.createElement("span"));
	username.innerHTML = "You";
	username.style.fontWeight = "bold";
	//username.style.marginLeft = "15px";
	username.style.fontSize = "16px";
	username.style.fontFamily = "Helvetica";
	var textArea = user_reply.appendChild(document.createElement("textarea"));
	textArea.id = "user_reply";
	textArea.placeholder = "Reply...";
	textArea.style.height = "20px";
	textArea.style.width = "70%";
	textArea.style.marginLeft = "10px";
	textArea.style.border = "1px solid grey";
	textArea.style.borderRadius = "5px";
	textArea.style.resize = "none";
	textArea.style.marginBottom = "10px";
	var button2 = user_reply.appendChild(document.createElement("button"));
	button2.innerHTML = "Comment";
	button2.type = "button";
	button2.style.borderRadius= "5px";
    button2.style.backgroundColor= "#e7e7e7";
    button2.style.color= "black";
    button2.style.fontSize= "14px";
	button2.style.border = "1px solid grey";
	button2.style.marginTop = "5px";
	button2.style.marginLeft = "15px";
	user_reply.style.alignItems = "center";
	marker.appendChild(user_reply);

	var user_reply1 = document.createElement("div");
	user_reply1.style.marginBottom = "10px";
	user_reply1.style.backgroundColor = "#F5F5F5"
	// user_reply1.style.marginLeft = "-5px";
	// user_reply1.style.marginRight = "-5px";
	user_reply1.style.alignItems = "center";
	user_reply1.style.display = "flex";
	var div = document.createElement("div");
	div.style.display= "inline-flex";
  	div.style.alignItems= "center"; 
	var img3= div.appendChild(document.createElement("img"));
	img3.src = "/static/neutral_avatar.png";
	img3.alt = "User Avatar";
	img3.className = "avatar";
	img3.style.width = "30px";
	img3.style.height = "30px";
	img3.style.borderRadius = "55%";
	var username = div.appendChild(document.createElement("span"));
	username.innerHTML = "You";
	username.style.fontWeight = "bold";
	//username.style.marginLeft = "15px";
	username.style.fontSize = "16px";
	username.style.fontFamily = "Helvetica";
	var para_reply = div.appendChild(document.createElement("p"));
	para_reply.id = "para_reply";
	para_reply.style.fontSize = "15px";
	para_reply.style.fontFamily = "Arial";
	para_reply.style.marginLeft = "25px";
	para_reply.style.wordBreak = "break-all";
	para_reply.style.marginBottom = "10px";
	var button3 = div.appendChild(document.createElement("button"));
	button3.innerHTML = "Edit";
	button3.type = "button";
	button3.style.borderRadius= "5px";
    button3.style.backgroundColor= "#e7e7e7";
    button3.style.color= "black";
    button3.style.fontSize= "14px";
	button3.style.border = "1px solid grey";
	button3.style.marginTop = "5px";
	button3.style.marginLeft = "15px";
	button3.style.marginRight = "15px";
	user_reply1.appendChild(div);
	user_reply1.style.display = "none";
	marker.appendChild(user_reply1);

	button2.onclick = function(){
		var reply = document.getElementById("user_reply").value;
		logData("user_reply", reply);
		if(reply != ""){
			user_reply.style.display = "none";
			para_reply.innerHTML = reply;
			//user_reply1.style.display = "block";
			user_reply1.style.display = "flex";
		}
	};

	button3.onclick = function(){
		//user_reply.style.display = "block";
		user_reply.style.display = "flex";
		user_reply1.style.display = "none";
	};
	
	return marker;
}

function openCommentBox(instance, lineNumber, gutter, clickEvent){

	var elementId = instance.options.elementId;
	var user = instance.options.user;
	var codesugg_user = instance.options.codesugg_user;
	var comment = instance.options.comment;
	var comment_lineNumber = instance.options.comment_lineNumber;
	var sub_lineNumber = instance.options.sub_lineNumber;
	var add_lineNumber = instance.options.add_lineNumber;
	var total_lineNumber = instance.options.total_lineNumber;
	var line_widget = instance.addLineWidget(comment_lineNumber, makeTextArea(user, comment, codesugg_user, elementId), {above: true, noHScroll: true});

	// Get the textarea element and its value
	var code = instance.options.code_suggestion;

    // Initialize CodeMirror with the textarea and set the code
    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("codeEditor"+elementId), {
      lineNumbers: true,
	  firstLineNumber: comment_lineNumber,
    });
    myCodeMirror.setValue(code); // Set the initial code in the editor

	for (var i = sub_lineNumber; i < add_lineNumber; i++) {
		myCodeMirror.addLineClass(i, "background", "mark_sub");
	}
	for (var i = add_lineNumber; i <= total_lineNumber; i++) {
		myCodeMirror.addLineClass(i, "background", "mark_add");
	}
}

function handleGutterClick(instance, lineNumber, gutter, clickEvent){
	var info = instance.lineInfo(lineNumber);
    var prevMsg = "";
	var realLineNumber = lineNumber + instance.options.firstLineNumber;

	if (!reviewRemarks[instance.hunkId]) {
		reviewRemarks[instance.hunkId] = {};
	}

    if (realLineNumber in reviewRemarks[instance.hunkId]){
    	prevMsg = reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent
	}

    var msg = prompt("Please enter review remark", prevMsg);

    if (msg == null) {
    	return
    }

	// instance.addLineWidget(lineNumber, makeMarker(msg), {coverGutter: true, noHScroll: true});

    if (realLineNumber in reviewRemarks[instance.hunkId]) {
    	if (msg == "") {
	    	// DELETE COMMENT
            logData("deletedComment", `${instance.hunkId}${instance.hunkSide}-${realLineNumber}`);
			reviewRemarks[instance.hunkId][realLineNumber].clear()
			// instance.setGutterMarker(lineNumber, "remarks", null);
			delete reviewRemarks[instance.hunkId][realLineNumber];
    	} else {
    		// UPDATE COMMENT
            logData("updateComment",
                `${instance.hunkId}${instance.hunkSide}-${realLineNumber}-${msg}`)
    		// info.gutterMarkers.remarks.title = msg;
    		// reviewRemarks[instance.hunkId][realLineNumber] = msg;
			reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent = msg
			reviewRemarks[instance.hunkId][realLineNumber].changed()
    	}
    } else {
    	if (msg == "") {
    		// CANCEL COMMENT
			logData("cancelComment",
                `${instance.hunkId}${instance.hunkSide}-${realLineNumber}`)
		} else {
    		// ADD COMMENT
            logData("addComment",
                `${instance.hunkId}${instance.hunkSide}-${realLineNumber}-${msg}`)
			// instance.setGutterMarker(lineNumber, "remarks", makeMarker(msg));

    		var line_widget = instance.addLineWidget(lineNumber, makeMarker(msg), {coverGutter: true, noHScroll: true});
    		reviewRemarks[instance.hunkId][realLineNumber] = line_widget;
            // addComment(lineNumber, msg, instance.hunkId, instance.hunkSide)
		}
    }
}