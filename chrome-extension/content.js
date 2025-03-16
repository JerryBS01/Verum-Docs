// Function to create a tooltip
function createTooltip(text) {
    let tooltip = document.createElement("div");
    tooltip.classList.add("custom-tooltip");
    tooltip.innerText = text;
    document.body.appendChild(tooltip);
    return tooltip;
}

// Function to highlight text and add tooltip behavior
function highlightAndAddTooltip(targetTextArray, tooltipTextArray) {
    if (targetTextArray.length !== tooltipTextArray.length) {
        console.error('The number of target texts and tooltip texts must be the same.');
        return;
    }

    targetTextArray.forEach((targetText, index) => {
        const regex = new RegExp(`(${targetText})`, "gi");

        document.querySelectorAll("p, span, div").forEach((node) => {
            if (node.childNodes.length === 1 && node.nodeType === Node.ELEMENT_NODE) {
                let match = node.innerHTML.match(regex);
                if (match) {
                    node.innerHTML = node.innerHTML.replace(regex, `<span class="highlighted-text" data-tooltip="${tooltipTextArray[index]}">$1</span>`);
                }
            }
        });
    });

    document.querySelectorAll(".highlighted-text").forEach((element) => {
        let tooltip;
        const tooltipText = element.getAttribute('data-tooltip'); 

        element.addEventListener("mouseenter", (event) => {
            tooltip = createTooltip(tooltipText);
            tooltip.style.left = event.pageX + "px";
            tooltip.style.top = event.pageY + 20 + "px"; 
        });

        element.addEventListener("mouseleave", () => {
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Extract article content
function extractArticle() {
    let articleElement = document.querySelector("article");

    if (!articleElement) {
        console.log("No article content found.");
        return;
    }

    let paragraphs = articleElement.querySelectorAll("p:not([data-component='GridItem']):not([data-component='GridRow'])");

    let articleText = Array.from(paragraphs)
        .map(p => p.innerText.trim())
        .filter(text => text.length > 50)
        .join("\n\n");

    console.log("Extracted Main Article:", articleText); 

    chrome.runtime.sendMessage({
        action: "sendArticle",
        article: articleText
    });
}

// Listen for the API response in content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "apiResponse") {
      const data = message.response;
      console.log("Received API Response in Content Script:", data);
      if (data) {
        let texts = [];
        let reasons = data?.["gpt_bias_analysis"]?.["reasons"];
        let sentences = [];
        for (const num in reasons) {
            console.log(reasons[num]);
            texts.push(reasons[num]["description"]);
            sentences.push(reasons[num]["sentence"]);
        }
        console.log(sentences, texts)
        highlightAndAddTooltip(sentences, texts)
      }
    }
});

extractArticle();
