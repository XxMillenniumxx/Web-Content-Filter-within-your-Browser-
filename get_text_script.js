function extractTextWithoutScriptsAndStylesAndTags(element) {
  var textBuffer = [];
  var stack = [element];

  var regex = /<[^>]*>/g;

  while (stack.length > 0) {
    var currentNode = stack.pop();

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      var tagName = currentNode.tagName.toLowerCase();
      if (tagName === 'script' || tagName === 'style') {
        continue;
      }
      if (tagName === 'link' && currentNode.getAttribute('rel') === 'stylesheet') {
        continue; 
      }
    }

    if (currentNode.nodeType === Node.TEXT_NODE) {
      var textContent = currentNode.textContent.trim();
      if (textContent) {
        textBuffer.push(textContent);
      }
    }

    var children = currentNode.childNodes;
    for (var i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }

  var text = textBuffer.join(' ');

  text = text.replace(regex, '');

  return text;
}
function send() {
    if (!scriptAlreadyRun) {
        chrome.runtime.sendMessage(extractTextWithoutScriptsAndStylesAndTags(document.documentElement));
        scriptAlreadyRun = true;
    }
}


var scriptAlreadyRun = false;
send();
window.addEventListener('popstate', function() {
    scriptAlreadyRun = false;
    send();
});
