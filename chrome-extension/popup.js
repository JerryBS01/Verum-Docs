document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    let currentTabId = null;

    const closeBtn = document.getElementById('closeButton');
    if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.close(); 
        });
    }

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
                loading();
                let cleanedText = message.article.trim();
                chrome.runtime.sendMessage({ action: "fetchAPI", text: cleanedText }, (response) => {
                    if (response.success) {
                        console.log("Received API data:", response.data);

                        let data = response.data;
            
                        // Send the data to content script
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            chrome.tabs.sendMessage(tabs[0].id, { action: "apiResponse", response: response.data });
                        });

                        setTimeout(() => {
                            updatePopupBiased(data)
                        }, 5000);
                    } else {
                        console.error("API request failed:", response.error);
                    }
                });

            }
        });
    });

    function loading() {
        document.body.innerHTML = `
          <div 
            style="
              display: flex; 
              justify-content: center; 
              align-items: center; 
              width: 100vw; 
              height: 100vh; 
              margin: 0; 
              background-color: #362E2D; 
              position: relative;
            "
          >
            <!-- Main content (GIF first, text second) -->
            <div style="text-align: center;">
              <!-- Loading GIF -->
              <div 
                style="
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  margin: 0 auto;
                "
              >
                <img src="loading2.gif" alt="Loading..." style="width: 70px;">
              </div>
      
              <!-- Analyzing Text BELOW the GIF -->
              <div 
                id="loadingText"
                style="
                  background: rgba(255, 255, 255, 0.2); 
                  padding: 5px 10px; 
                  border-radius: 10px; 
                  font-size: 14px; 
                  display: inline-block;
                  margin-top: 15px;
                "
              >
                Analyzing Article ⏳
              </div>
            </div>
          </div>      
        `;
      
        // Animate the loading text: "Loading." -> "Loading.." -> "Loading..." -> repeat
        let dotCount = 1;
        const textElem = document.getElementById('loadingText');
        setInterval(() => {
          if (dotCount > 3) dotCount = 1;
          textElem.textContent = 'Analsing Article⏳' + '.'.repeat(dotCount);
          dotCount++;
        }, 500);
      }
      
      
      function updatePopupBiased(data) {
        let local_pred = data["local_model_prediction"];
        let gpt_bias = data["gpt_bias_analysis"]["bias"];
        let caution = local_pred != gpt_bias;
        let texts = [];
        let reasons = data["gpt_bias_analysis"]["reasons"];
        
        for (const num in reasons) {
            texts.push(reasons[num]["reason"]);
        }
    
        // Map each message to an <li> element
        let messagesHtml = texts.map(text => {
            return `<li class="message">${text}</li>`;
        }).join("");
    
        body.innerHTML = `
            <div class="container" style="background-color: #362E2D; padding: 20px; text-align: center; color: white;">
                <div class="header" style="background: rgba(255, 255, 255, 0.2); padding: 5px 10px; border-radius: 10px; font-size: 14px; display: inline-block;">
                    Our Model said it's ${local_pred ? 'Unbiased ✅' : 'Biased ⚠️'}
                </div>
                <div class="tree" style="width: 80px; height: 80px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 15px auto;">
                    <img src="${caution ? 'caution.png' : local_pred ? 'unbiased.png' : 'biased.png'}" alt="Icon" style="width: 70px;">
                </div>
                <div class="header" style="background: rgba(255, 255, 255, 0.2); padding: 5px 10px; border-radius: 10px; font-size: 14px; display: inline-block;">
                    ChatGPT said it's ${gpt_bias ? 'Unbiased ✅' : 'Biased ⚠️'}
                </div>
    
                <div class="message" style="margin-top: 10px; font-size: 13px; font-weight: bold;">
                    Key Points
                </div>
    
                <!-- Wrap the <ul> in a <div> with text-align: center. Then set the <ul> to display: inline-block -->
                <div style="text-align: center;">
                    <ul style="display: inline-block; text-align: left; margin: 0; padding: 0 20px;">
                        ${messagesHtml}
                    </ul>
                </div>
    
                <div class="message" style="margin-top: 25px; font-size: 13px; font-weight: bold;">
                    Note:
                </div>
                <div class="message">
                    Our model is optimized for political news articles!
                </div>
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
                Loading...
            </div>
        </div>
    `;
        setTimeout(() => {
            body.innerHTML = `
                <div class="container" style="background-color: #362E2D; padding: 20px; text-align: center; color: white;">
                    <div class="header" style="background: rgba(255, 255, 255, 0.2); padding: 5px 10px; border-radius: 10px; font-size: 14px; display: inline-block;">
                        This article is unbiased ✅
                    </div>
                    <div class="tree" style="width: 80px; height: 80px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 15px auto;">
                        <img src="unbiased.png" alt="Unbiased" style="width: 70px;">
                    </div>
                    <div class="message" style="margin-top: 10px; font-size: 13px;">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.
                    </div>
                    <div class="message">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.</div>
                    <div class="message">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu.</div>
                </div>
            `;
        }, 10000);
    }
  });