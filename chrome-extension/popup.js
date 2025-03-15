document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    let currentTabId = null;

    document.getElementById("startButton").addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                console.error("Error: No active tab found.");
                return;
            }
            currentTabId = tabs[0].id; // Simpan ke variabel global

            chrome.scripting.executeScript({
                target: { tabId: currentTabId },
                files: ["content.js"]
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Script injection failed:", chrome.runtime.lastError.message);
                }
            });
        });

        chrome.runtime.onMessage.addListener(function (message) {
            if (message.action === "sendArticle") {
                let cleanedText = message.article.trim();
                chrome.runtime.sendMessage({ action: "fetchAPI", text: cleanedText }, (response) => {
                    if (response.success) {
                        console.log("Received API data:", response.data);
            
                        // Send the data to content script
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            chrome.tabs.sendMessage(tabs[0].id, { action: "apiResponse", response: response.data });
                        });
                    } else {
                        console.error("API request failed:", response.error);
                    }
                });

                // const apiUrl = "http://15.235.199.204:8000/predict"; 

                // fetch(apiUrl, {
                //     method: "POST",
                //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
                //     body: new URLSearchParams({ "text": cleanedText })
                // })
                // .then(response => response.json())
                // .then(data => {
                //     console.log("API Response:", data["gpt_bias_analysis"]["reasons"]);
                    
                //     if (currentTabId) {
                //         chrome.tabs.sendMessage(currentTabId, { action: "apiResponse", response: data }, function(response) {
                //             if (chrome.runtime.lastError) {
                //                 console.error("Failed to send message:", chrome.runtime.lastError.message);
                //             }
                //         });
                //     } else {
                //         console.error("Error: No tabId found when trying to send message.");
                //     }
                // })
                // .catch(error => {
                //     console.error("Error with API request:", error);
                //     alert("There was an error with the request.");
                // });

                updatePopupUnbiased(cleanedText);
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