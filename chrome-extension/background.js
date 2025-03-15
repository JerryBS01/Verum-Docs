chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchAPI") {
      
      fetch("http://15.235.199.204:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ "text": message.text })
      })
      .then(response => response.json())
      .then(data => {
          console.log("API Response:", data);
          sendResponse({ success: true, data: data });
      })
      .catch(error => {
          console.error("API Error:", error);
          sendResponse({ success: false, error: error.message });
      });

      return true; // Keeps sendResponse alive for async request
  }
});
