var log_records = [];  // Array of log records returned to Flask
var log_remarks = [];  // Array of remarks to be shown again in the second review

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
		var string_remarks = JSON.stringify(log_remarks);
        sessionStorage.setItem("remarks", string_remarks);
    });
});

var hunks = [];

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
			editor_left.on("gutterClick", handleGutterClick);
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
	name.innerHTML = "<b>You: </b>";
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
	if(user == "Timothy (Tim)"){
		//img.src = "/static/human_avatar.png";
		img.src = "/static/tim_photo.jpg";
	}else if(user == "Generative AI Bot"){
		img.src = "/static/bot_avatar.png";
	}
	img.alt = "User Avatar";
	img.className = "avatar";
	img.style.width = "35px";
	img.style.height = "35px";
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
	if(codesugg_user == "Timothy (Tim)"){
		//img1.src = "/static/human_avatar.png";
		img1.src = "/static/tim_photo.jpg";
	}else if(codesugg_user == "Generative AI Bot"){
		img1.src = "/static/bot_avatar.png";
	}
	img1.alt = "User Avatar";
	img1.className = "avatar";
	img1.style.width = "35px";
	img1.style.height = "35px";
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
	icon.innerHTML = "Suggested Code Fix";
	icon.style.fontSize = "14px";
	icon.style.color = "grey";
	icon.style.padding= "8px 16px";
	icon.style.fontFamily = "Noto sans-serif";
	var item2 = list.appendChild(document.createElement("li"));
	var textArea = document.createElement("textarea");
	textArea.id = "codeEditor"+elementId;
	item2.appendChild(textArea);
	item2.style.borderBottom = "1px solid grey";
	var item3 = list.appendChild(document.createElement("li"));
	item3.style.padding = "5px";
	item3.style.textAlign = "right";
	
	var commitText = item3.appendChild(document.createElement("p")); //hidden textarea for seeting commit decision
	commitText.id = "hiddenCommitDec";
	commitText.style.display="none";

	var button1 = item3.appendChild(document.createElement("button"));
	button1.type="button";
	button1.innerHTML = "Approve";
	button1.id="commit";
	button1.style.borderRadius= "5px";
	button1.style.backgroundColor= "#e7e7e7";
    button1.style.color= "black";
    button1.style.fontSize= "14px";
	button1.style.border = "1px solid grey";
	button1.style.cursor = "pointer";
	var button2 = item3.appendChild(document.createElement("button"));
	button2.type="button";
	button2.innerHTML = "Decline";
	button2.id="commit";
	button2.style.borderRadius= "5px";
	button2.style.backgroundColor= "#e7e7e7";
    button2.style.color= "black";
    button2.style.fontSize= "14px";
	button2.style.border = "1px solid grey";
	button2.style.marginLeft = "5px";
	button2.style.cursor = "pointer";
	marker.appendChild(list);

	button1.onclick = function(){
		logData("commit_changes", "yes");
		messageDiv.innerHTML = "Suggested code fix approved";
		messageDiv.style.color = "green";
		messageDiv.style.fontSize = "14px";
		messageDiv.style.fontStyle = "bold";
		messageDiv.style.fontFamily = "Noto sans-serif";
		document.getElementById("hiddenCommitDec").value = "committed";
		button1.disabled = true;
		button1.style.opacity = "0.5";
		button2.disabled = false;
		button2.style.opacity = "1";
	}

	button2.onclick = function(){
		logData("commit_changes", "no");
		messageDiv.innerHTML = "Suggested Code Fix declined";
		messageDiv.style.color = "red";
		messageDiv.style.fontSize = "14px";
		messageDiv.style.fontStyle = "bold";
		messageDiv.style.fontFamily = "Noto sans-serif";
		document.getElementById("hiddenCommitDec").value = "declined";
		button2.disabled = true;
		button2.style.opacity = "0.5";
		button1.disabled = false;
		button1.style.opacity = "1";
	}


	var div_fb = document.createElement("div");
	div_fb.id = "container";
	div_fb.style.marginLeft = "20px";
	div_fb.style.display = "inline-flex";
	div_fb.style.alignItems = "center";
	div_fb.style.width = "95%";
	var span_fb = document.createElement("span");
	span_fb.id = "text";
	span_fb.title = "Enter to edit Feedback";
	span_fb.style.display = "none";
	span_fb.style.width = "95%";
	span_fb.style.padding = "5px 5px";
	span_fb.style.fontFamily = "Arial";
	span_fb.style.fontSize = "16px";
	span_fb.style.wordBreak = "break-all";
	div_fb.appendChild(span_fb);
	var input_fb = document.createElement("input");
	input_fb.type = "text";
	input_fb.id = "input";
	input_fb.placeholder = "Provide Feedback...";
	input_fb.style.width = "95%";
	input_fb.style.padding = "5px 5px";
	input_fb.style.fontFamily = "Arial";
	input_fb.style.fontSize = "16px";
	input_fb.style.border = "1px solid grey";
	input_fb.style.borderRadius = "5px";
	div_fb.appendChild(input_fb);

	var submit = document.createElement("img");
	submit.src = "/static/submit_arrow.png";
	submit.title = "Submit feedback";
	submit.style.width = "5%";
	submit.style.marginLeft = "10px";
	div_fb.appendChild(submit);

	var edit = document.createElement("img");
	edit.src = "/static/edit_button.png";
	edit.alt = "Edit Feedback";
	edit.style.width = "5%";
	edit.style.marginLeft = "10px";
	edit.style.display = "none";
	div_fb.appendChild(edit);
	
	marker.appendChild(div_fb);

	// span_fb.addEventListener("click", () => {
	// 	span_fb.style.display = "none";
	// 	input_fb.style.display = "inline-block";
	// 	submit.style.display = "inline-block";
	// 	input_fb.focus();
	// });

	submit.addEventListener("click", () => {
		logData("feedback", input_fb.value)
		span_fb.textContent = input_fb.value;
		input_fb.style.display = "none";
		span_fb.style.display = "inline-block";
		div_fb.style.backgroundColor = "aliceblue";
		submit.style.display = "none";
		edit.style.display = "inline-block";
	});

	edit.addEventListener("click", () => {
		span_fb.style.display = "none";
		input_fb.style.display = "inline-block";
		submit.style.display = "inline-block";
		edit.style.display = "none";
		input_fb.focus();
	});

	// var user_reply = document.createElement("div");
	// user_reply.style.marginBottom = "10px";
	// user_reply.style.backgroundColor = "#F5F5F5"
	// // user_reply.style.marginLeft = "-5px";
	// // user_reply.style.marginRight = "-5px";
	// user_reply.style.alignItems = "center";
	// user_reply.style.display = "flex";
	// var img2= user_reply.appendChild(document.createElement("img"));
	// img2.src = "/static/neutral_avatar.png";
	// img2.alt = "User Avatar";
	// img2.className = "avatar";
	// img2.style.width = "30px";
	// img2.style.height = "30px";
	// img2.style.borderRadius = "55%";
	// var username = user_reply.appendChild(document.createElement("span"));
	// username.innerHTML = "You";
	// username.style.fontWeight = "bold";
	// //username.style.marginLeft = "15px";
	// username.style.fontSize = "16px";
	// username.style.fontFamily = "Helvetica";

	// var textArea = user_reply.appendChild(document.createElement("textarea"));
	// textArea.id = "user_reply";
	// textArea.placeholder = "Reply...";
	// textArea.style.height = "20px";
	// textArea.style.width = "70%";
	// textArea.style.marginLeft = "10px";
	// textArea.style.border = "1px solid grey";
	// textArea.style.borderRadius = "5px";
	// textArea.style.resize = "none";
	// textArea.style.marginBottom = "10px";
	// var button2 = user_reply.appendChild(document.createElement("button"));
	// button2.innerHTML = "Comment";
	// button2.type = "button";
	// button2.style.borderRadius= "5px";
    // button2.style.backgroundColor= "#e7e7e7";
    // button2.style.color= "black";
    // button2.style.fontSize= "14px";
	// button2.style.border = "1px solid grey";
	// button2.style.marginTop = "5px";
	// button2.style.marginLeft = "15px";
	// user_reply.style.alignItems = "center";
	// marker.appendChild(user_reply);

	// var user_reply1 = document.createElement("div");
	// user_reply1.style.marginBottom = "10px";
	// user_reply1.style.backgroundColor = "#F5F5F5"
	// // user_reply1.style.marginLeft = "-5px";
	// // user_reply1.style.marginRight = "-5px";
	// user_reply1.style.alignItems = "center";
	// user_reply1.style.display = "flex";
	// var div = document.createElement("div");
	// div.style.display= "inline-flex";
  	// div.style.alignItems= "center"; 
	// var img3= div.appendChild(document.createElement("img"));
	// img3.src = "/static/neutral_avatar.png";
	// img3.alt = "User Avatar";
	// img3.className = "avatar";
	// img3.style.width = "30px";
	// img3.style.height = "30px";
	// img3.style.borderRadius = "55%";
	// var username = div.appendChild(document.createElement("span"));
	// username.innerHTML = "You";
	// username.style.fontWeight = "bold";
	// //username.style.marginLeft = "15px";
	// username.style.fontSize = "16px";
	// username.style.fontFamily = "Helvetica";
	// var para_reply = div.appendChild(document.createElement("p"));
	// para_reply.id = "para_reply";
	// para_reply.style.fontSize = "15px";
	// para_reply.style.fontFamily = "Arial";
	// para_reply.style.marginLeft = "25px";
	// para_reply.style.wordBreak = "break-all";
	// para_reply.style.marginBottom = "10px";
	// var button3 = div.appendChild(document.createElement("button"));
	// button3.innerHTML = "Edit";
	// button3.type = "button";
	// button3.style.borderRadius= "5px";
    // button3.style.backgroundColor= "#e7e7e7";
    // button3.style.color= "black";
    // button3.style.fontSize= "14px";
	// button3.style.border = "1px solid grey";
	// button3.style.marginTop = "5px";
	// button3.style.marginLeft = "15px";
	// button3.style.marginRight = "15px";
	// user_reply1.appendChild(div);
	// user_reply1.style.display = "none";
	// marker.appendChild(user_reply1);

	// button2.onclick = function(){
	// 	var reply = document.getElementById("user_reply").value;
	// 	logData("user_reply", reply);
	// 	if(reply != ""){
	// 		user_reply.style.display = "none";
	// 		para_reply.innerHTML = reply;
	// 		//user_reply1.style.display = "block";
	// 		user_reply1.style.display = "flex";
	// 	}
	// };

	// button3.onclick = function(){
	// 	//user_reply.style.display = "block";
	// 	user_reply.style.display = "flex";
	// 	user_reply1.style.display = "none";
	// };
	
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
	  theme: "MyCustomEditor",
    });
    myCodeMirror.setValue(code); // Set the initial code in the editor

	for (var i = sub_lineNumber; i < add_lineNumber; i++) {
		myCodeMirror.addLineClass(i, "background", "mark_sub");
	}
	for (var i = add_lineNumber; i <= total_lineNumber; i++) {
		myCodeMirror.addLineClass(i, "background", "mark_add");
	}
}

var instance;
var lineNumber;

function handleGutterClick(instancetest, lineNumbertest, gutter, clickEvent){
	instance = instancetest;
	lineNumber = lineNumbertest;
	var realLineNumber = lineNumber + instance.options.firstLineNumber;

	if (!reviewRemarks[instance.hunkId]) {
		reviewRemarks[instance.hunkId] = {};
	}

    if (realLineNumber in reviewRemarks[instance.hunkId]){
    	prevMsg = reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent;
		document.getElementById("review-remark").value = prevMsg;
	}else{
		document.getElementById("review-remark").value = "";
	}

    $("#remark-popup-window").show();
}

function recordRemark() {

	var msg = document.getElementById("review-remark").value;

	document.getElementById("review-remark").value = "";

	//var info = instance.lineInfo(lineNumber);
    var prevMsg = "";
	var realLineNumber = lineNumber + instance.options.firstLineNumber;

	if (!reviewRemarks[instance.hunkId]) {
		reviewRemarks[instance.hunkId] = {};
	}

    if (realLineNumber in reviewRemarks[instance.hunkId]){
    	prevMsg = reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent;
		document.getElementById("review-remark").value = prevMsg;
	}
	// instance.addLineWidget(lineNumber, makeMarker(msg), {coverGutter: true, noHScroll: true});

    if (realLineNumber in reviewRemarks[instance.hunkId]) {
    	if (msg == "") {
	    	// DELETE COMMENT
            logData("deletedComment", `${instance.hunkId}${instance.hunkSide}-${realLineNumber}`);
			reviewRemarks[instance.hunkId][realLineNumber].clear()
			// instance.setGutterMarker(lineNumber, "remarks", null);
			delete reviewRemarks[instance.hunkId][realLineNumber];
			if(isRemarkPresent(log_remarks, lineNumber, instance.hunkId)) {
				log_remarks = removeRemark(log_remarks, instance.hunkSide, lineNumber, instance.hunkId);
			}
    	} else {
    		// UPDATE COMMENT
            logData("updateComment",
                `${instance.hunkId}${instance.hunkSide}-${realLineNumber}-${msg}`)
    		// info.gutterMarkers.remarks.title = msg;
    		// reviewRemarks[instance.hunkId][realLineNumber] = msg;
			reviewRemarks[instance.hunkId][realLineNumber].clear()
			delete reviewRemarks[instance.hunkId][realLineNumber];
			var line_widget = instance.addLineWidget(lineNumber, makeMarker(msg), {coverGutter: true, noHScroll: true});
    		reviewRemarks[instance.hunkId][realLineNumber] = line_widget;

			reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent = msg
			reviewRemarks[instance.hunkId][realLineNumber].changed()
			if(isRemarkPresent(log_remarks, lineNumber, instance.hunkId)) {
				log_remarks = updateRemark(log_remarks, instance.hunkSide, lineNumber, instance.hunkId, msg);
			}
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
			reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent = msg
			log_remarks.push(new Remark(lineNumber, msg, instance.hunkId, instance.hunkSide));
			//reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent = msg
            // addComment(lineNumber, msg, instance.hunkId, instance.hunkSide)
		}
    }
}

function Remark(line, message, hunk, side) {
	this.line = line;
	this.message = message;
	this.hunk = hunk;
	this.side = side;
}

function isRemarkPresent(remarks_list, line, hunk) {
	for(i = 0; i < remarks_list.length; i++) {
		if(remarks_list[i].hunk == hunk) {
			if(remarks_list[i].line == line) {
				return true;
			}
		}
	}
	return false;
}

function updateRemark(remarks_list, side, line, hunk, message) {
	for(i = 0; i < remarks_list.length; i++) {
		if(remarks_list[i].hunk == hunk && remarks_list[i].side == side) {
			if(remarks_list[i].line == line) {
				remarks_list[i].message = message;
				return remarks_list;
			}
		}
	}
	return null;
}

function removeRemark(remarks_list, side, line, hunk) {
	for(i = 0; i < remarks_list.length; i++) {
		if(remarks_list[i].hunk == hunk && remarks_list[i].side == side) {
			if(remarks_list[i].line == line) {
				remarks_list.splice(i, 1);
				return remarks_list;
			}
		}
	}
	return null;
}
