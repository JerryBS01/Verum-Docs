// Function to create a tooltip
function createTooltip(text) {
    let tooltip = document.createElement("div");
    tooltip.classList.add("custom-tooltip");
    tooltip.innerText = text;
    document.body.appendChild(tooltip);
    return tooltip;
}

// Function to highlight text and add tooltip behavior
function highlightAndAddTooltip(targetText, tooltipText) {
    const regex = new RegExp(`(${targetText})`, "gi");
    
    document.querySelectorAll("p, span, div").forEach((node) => {
        if (node.childNodes.length === 1 && node.nodeType === Node.ELEMENT_NODE) {
            let match = node.innerHTML.match(regex);
            if (match) {
                node.innerHTML = node.innerHTML.replace(regex, `<span class="highlighted-text">$1</span>`);
            }
        }
    });

    // Add event listeners for tooltip
    document.querySelectorAll(".highlighted-text").forEach((element) => {
        let tooltip;
        element.addEventListener("mouseenter", (event) => {
            tooltip = createTooltip(tooltipText);
            tooltip.style.left = event.pageX + "px";
            tooltip.style.top = event.pageY + 20 + "px"; // Offset tooltip a bit
        });

        element.addEventListener("mouseleave", () => {
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Get words to highlight from storage
chrome.storage.sync.get("highlightSentences", (data) => {
    let sentences = data.highlightSentences || ["Five Russian citizens, including the captain, were on board the container vessel, Russian media reported, citing the embassy.", "Challenges for modern shipping"];
    sentences.forEach((sentence) => {
        highlightAndAddTooltip(sentence, "Stay focused! 🧠");
    });
});

function extractArticle() {
    let articleElement = document.querySelector("article");

    if (!articleElement) {
        console.log("No article content found.");
        return;
    }

    // Select only paragraphs inside the article, excluding GridItem and GridRow
    let paragraphs = articleElement.querySelectorAll("p:not([data-component='GridItem']):not([data-component='GridRow'])");

    // Filter out irrelevant short texts
    let articleText = Array.from(paragraphs)
        .map(p => p.innerText.trim())
        .filter(text => text.length > 50) // Ignore very short texts (like captions or ads)
        .join("\n\n");

    console.log("Extracted Main Article:", articleText); // ✅ Logs only meaningful content

    // Send the extracted content to the popup
    chrome.runtime.sendMessage({
        action: "sendArticle",
        article: articleText
    });
}

extractArticle();
