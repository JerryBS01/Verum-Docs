document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;

  document.getElementById("startButton").addEventListener("click", function () {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
        });
      });
      chrome.runtime.onMessage.addListener(function (message) {
        if (message.action === "sendArticle") {
            console.log("Extracted Article:", message.article);
            updatePopupUnbiased(message.article);
        }
    });
  });
  function updatePopupBiased(articleContent) {
    body.innerHTML = `
      <div class="container" style="background-color: #362E2D; padding: 20px; text-align: center; color: white;">
          <div class="header" style="background: rgba(255, 255, 255, 0.2); padding: 5px 10px; border-radius: 10px; font-size: 14px; display: inline-block;">
              This article is biased ⚠️
          </div>
          <div class="tree" style="width: 80px; height: 80px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 15px auto;">
              <img src="biased.png" alt="Biased" style="width: 70px;">
          </div>
          <div class="message" style="margin-top: 10px; font-size: 13px;">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.
          </div>
          <div class="message">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.</div>
          <div class="message">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.</div>
      </div>
  `;
  }
  function updatePopupUnbiased(articleContent) {
    body.innerHTML = `
      <div class="container" style="background-color: #362E2D; padding: 20px; text-align: center; color: white;">
          <div class="header" style="background: rgba(255, 255, 255, 0.2); padding: 5px 10px; border-radius: 10px; font-size: 14px; display: inline-block;">
              This article is unbiased ✅
          </div>
          <div class="tree" style="width: 80px; height: 80px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 15px auto;">
              <img src="unbiased.png" alt="Biased" style="width: 70px;">
          </div>
          <div class="message" style="margin-top: 10px; font-size: 13px;">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.
          </div>
          <div class="message">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.</div>
          <div class="message">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.</div>
      </div>
  `;
  }
});