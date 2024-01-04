/** blockpage initialization */
/* globals chrome */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-phraseArray-limit') {
    const phraseArray = message.data.phraseArray;
    const limit = message.data.limit;
    // Например, вставка значения `phraseArray` в элемент с id "phrases"
    document.querySelector("#phrases").innerText = phraseArray;
    // И вставка значения `limit` в элемент с id "score"
    document.querySelector("#score").innerText = "(score " + limit + ")";
  }
});



document.querySelector("#showOptions").onclick = function() {
    chrome.runtime.openOptionsPage();
};