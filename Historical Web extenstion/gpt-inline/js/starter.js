let apiKey;

// Function to fetch the API key from storage
function fetchApiKey() {
    chrome.storage.local.get("gptApiKey", function(data) {
        if (data && data.gptApiKey) {
            apiKey = data.gptApiKey;
            console.log(apiKey)
        } else {
            console.error("API key not found in storage");
            alert("API key not found in storage")
        }
    });
}

// Call the fetch function to retrieve the API key
fetchApiKey();

// Function to show the popup
function showPopup1(popupElement) {
    popupElement.style.display = 'block';
    popupElement.style.top = '20px'; // Position from the top
    popupElement.style.right = '20px'; // Position from the right
}

function showPopup() {
    popup.style.display = 'block';
    popup.style.top = '20px'; // Position from the top
    popup.style.right = '20px'; // Position from the right
}

// Function to hide the popup
function hidePopup() {
    popup.style.display = 'none';
}

const loadingSpinner = document.getElementById('loadingSpinner');
// Function to show custom result popup with "Ask More" button
function showCustomResultPopupWithAskMore(content,highlightedText) {
    // Set the content of the result popup
    resultContent.textContent = content;

    // Show the result popup
    resultPopup.style.display = 'block';

    // Remove existing buttons (if any)
    removeAllButtons();

    // Show "Ask More" button
    const askMoreButton = document.createElement('button');
    askMoreButton.textContent = 'Ask More';
    askMoreButton.style.marginTop = '10px';
    askMoreButton.style.marginRight = '10px';
    askMoreButton.style.padding = '10px 20px';
    askMoreButton.style.backgroundColor = '#4CAF50';
    askMoreButton.style.color = 'white';
    askMoreButton.style.border = 'none';
    askMoreButton.style.borderRadius = '4px';
    askMoreButton.style.cursor = 'pointer';
    askMoreButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    askMoreButton.style.transition = 'background-color 0.3s ease';
    askMoreButton.addEventListener('click', () => {
        // Hide the result popup
        hideResultPopup();
        // Show custom data input popup again
        showCustomDataInputPopup(highlightedText);
    });
    resultPopup.appendChild(askMoreButton);

    // Show the close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#FF3B30';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    closeButton.style.transition = 'background-color 0.3s ease';
    closeButton.addEventListener('click', () => {
        // Hide the result popup
        hideResultPopup();
    });
    resultPopup.appendChild(closeButton);
}

// Function to remove all buttons from the result popup
function removeAllButtons() {
    const buttons = resultPopup.querySelectorAll('button');
    buttons.forEach(button => {
        button.remove();
    });
}


// Function to show the result popup with the sample message
function showResultPopup(content) {
    console.log("Loading Background");
    console.log("Result Popup Element:", resultPopup);
    console.log("Loading Spinner Element:", loadingSpinner);

    // Set the content of the result popup
    resultContent.textContent = content;

    // Show the result popup
    resultPopup.style.display = 'block';

    // Enable the submit button
    const submitButton = document.querySelector('#selectForm button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Submit'; // Reset button text
        submitButton.disabled = false; // Enable the button
    } else {
        console.error("Submit button element is null.");
    }

    // Hide the first popup after the result popup is fully shown
    resultPopup.addEventListener('transitionend', () => {
        hidePopup();
    }, { once: true });
}

// Function to hide the result popup
function hideResultPopup() {
    resultPopup.style.display = 'none';
}

const apiUrl = 'https://api.openai.com/v1/chat/completions';

// Function to fetch custom result from the OpenAI API
async function fetchwebcontent(text) {
     // Replace 'YOUR_API_KEY' with your actual API key
    console.log("Section in function:", text);
    const payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "user",
                "content": `Summarize the following : ${text}`
            }
        ],
        "temperature": 0.5,
        "n": 1,
        "stop": ["\n"]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim(); // Accessing the 'content' part directly
        return content;
    } catch (error) {
        console.error('Error fetching custom result:', error);
        return 'Error: Failed to fetch custom result';
    }
}

// Function to summarize the section containing the highlighted text
async function summarizeSectionWithHighlightedText(highlightedText) {
    if (highlightedText) {
        const section = findSectionContainingHighlightedText(highlightedText);
        if (section) {
            const summary = await fetchwebcontent(section.textContent);
            console.log("Section:", section.textContent.trim());
            console.log("Summary:", summary);
            return summary;
        } else {
            console.log("Could not find section containing the highlighted text.");
        }
    } else {
        console.log("No text highlighted.");
    }
}

// Function to find the section containing the highlighted text
function findSectionContainingHighlightedText(highlightedText) {
    if (highlightedText) {
        const elements = document.querySelectorAll('h1, h2, h3, p, section');
        for (const element of elements) {
            if (element.textContent.includes(highlightedText)) {
                return element;
            }
        }
    }
    return null;
}

let userContext = null;

function getHighlightedText() {
    var highlightedText = "";
    if (window.getSelection) {
        var selection = window.getSelection();
        if (selection && selection.toString()) {
            highlightedText = selection.toString();
        }
    } else if (document.selection && document.selection.type != "Control") {
        highlightedText = document.selection.createRange().text;
    }
    return highlightedText;
}

async function getDictionaryMeaning(highlightedText) {
    
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const dictionaryMeaningPayload = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'user', content: `What is the dictionary meaning of the ${highlightedText}?` },
        ],
        temperature: 0.5,
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(dictionaryMeaningPayload)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const dictionaryMeaningData = await response.json();
        console.log("Dictionary Meaning:", dictionaryMeaningData.choices[0].message.content);
        return dictionaryMeaningData.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            return 'Error: API connection issue. Please try again later.';
        } else {
            return 'Error: Failed to fetch data';
        }
    }
}


async function summarizeAndProcess(highlightedText) {
    try {
        const webContent = await summarizeSectionWithHighlightedText(highlightedText);
        console.log("web_content:", webContent);
        const historicalData = await getHistoricalData(highlightedText, webContent);
        console.log("Historical Data:", historicalData);
        return historicalData
        // Process the historical data as needed
    } catch (error) {
        console.error('Error:', error);
        // Handle errors
    }
}


async function getHistoricalData(highlightedText, web_content) {
    
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const historicalDataPayload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "user",
                "content":`what is the historical details of ${highlightedText} in the following context ${web_content}?`
            },
            {
                "role": "assistant",
                "content": `i am developing a product which provides details about the text that they prefer to get a short detailed  historical data.when user provide a word then provide output in the following response format :<short historical details about the word><important dates><historical details reagrding to the context provided><make the response into these sections mentioned with proper header as given in tags>.For example if user prompt passed is what is the historical details of india in the following context india is good in sports  then below is the result expected : India, officially the Republic of India, is a country in South Asia known for its rich cultural heritage and diverse history. It has been home to several ancient civilizations and empires.

                Important Dates:
                - 15th August 1947: India gained independence from British rule.
                - 26th January 1950: India adopted its constitution and became a republic.
                
                Historical Details Regarding the Context Provided:
                India has a long history of sports, with cricket being one of the most popular sports in the country. It has produced many talented athletes who have excelled in various international competitions.`
            }
        ],
        "temperature": 0.6
    };

    const fetchData = async (retryCount = 0) => {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(historicalDataPayload)
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const historicalData = await response.json();
            if (historicalData.choices[0].message.content) {
                console.log("Historical Data:", historicalData.choices[0].message.content);
                return historicalData.choices[0].message.content;
            } else {
                // Retry after a delay with exponential backoff
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`Retrying in ${delay} milliseconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchData(retryCount + 1);
            }
        } catch (error) {
            console.error('Error:', error);
            if (retryCount < 3) { // Retry up to 3 times
                // Retry after a delay with exponential backoff
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`Retrying in ${delay} milliseconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchData(retryCount + 1);
            } else {
                console.error('Exceeded maximum number of retries.');
                return null; // Return null if maximum retries reached
            }
        }
    };

    return fetchData();
}


async function getCustomResultAndShowResult(highlightedText, userQuestion) {
    
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    async function fetchCustomResult(userQuestion) {
        const customResultPayload = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: `${userQuestion} in the context of ${highlightedText} `},
                { role: 'assistant', content: `I am developing a product where user highlights a keyword and needs to get some details about the keyword in his/her context. Here user highlighted the keyword ${highlightedText}`},
            ],
            temperature: 0.7,
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(customResultPayload)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const customResultData = await response.json();
            console.log("Custom Result:", customResultData.choices[0].message.content);
            // showResultPopup(customResultData.choices[0].message.content);
            
            return customResultData.choices[0].message.content;
        } catch (error) {
            console.error('Error:', error);
            // Return the error message
            return `Error: ${error.message}`;
        }
    }

    return await fetchCustomResult(userQuestion); // Start by fetching with the provided user question
}



// Function to handle option selection
function handleOptionSelection(highlightedText) {
    const selectOptions = document.getElementById('optionsDropdown'); // Define selectOptions here
    const selectedOption = selectOptions.value;
    switch(selectedOption) {
        case "dictionaryButton":
             return(getDictionaryMeaning(highlightedText));
            break;
        case "historicalButton":
            return(summarizeAndProcess(highlightedText));
            break;
        default:
            showResultPopup("No option selected.");
    }
}

// Function to show custom data input popup


// Function to show custom result popup with "Ask More" button
function showCustomDataInputPopup(highlightedText) {
    const customDataInputPopup = document.createElement('div');
    customDataInputPopup.id = 'customDataInputPopup';
    customDataInputPopup.style.position = 'fixed';
    customDataInputPopup.style.backgroundColor = '#f9f9f9';
    customDataInputPopup.style.padding = '20px';
    customDataInputPopup.style.borderRadius = '12px';
    customDataInputPopup.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
    customDataInputPopup.style.zIndex = '9999';
    customDataInputPopup.style.fontFamily = 'Arial, sans-serif';
    customDataInputPopup.style.top = '20px'; // Position from the top
    customDataInputPopup.style.right = '20px'; // Position from the right
    customDataInputPopup.style.width = '300px'; // Set the width to match the input popup

    // Add content to the custom data input popup
    customDataInputPopup.innerHTML = `
        <h2 style="margin-top: 0;">Custom Data Input</h2>
        <p>Enter your prompt:</p>
        <textarea id="customDataInput" style="width: 100%; height: 100px; resize: vertical;"></textarea>
        <button id="submitCustomDataButton" style="margin-top: 10px; padding: 10px 20px; background-color: #8BC34A; color: white; border: none; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">Submit</button>
        <button id="closeCustomDataInputButton" style="margin-top: 10px; padding: 10px 20px; background-color: #FF3B30; color: white; border: none; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">Close</button>
    `;

    // Append the custom data input popup to the document body
    document.body.appendChild(customDataInputPopup);

    // Add event listener for submit button
    document.getElementById('submitCustomDataButton').addEventListener('click', async () => {
        const submitButton = document.getElementById('submitCustomDataButton');
        const customDataInput = document.getElementById('customDataInput').value.trim();
        if (customDataInput !== '') {
            submitButton.textContent = 'Loading...'; // Change button text to 'Loading...'
            submitButton.disabled = true; // Disable the button while processing

            // Simulate loading for 2 seconds (2000 milliseconds)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const cust_data = await getCustomResultAndShowResult(highlightedText, customDataInput);
            customDataInputPopup.remove();
            showCustomResultPopupWithAskMore(cust_data,highlightedText);
            // Close the custom data input popup after submitting
            
        } else {
            alert("Please enter a prompt.");
        }
    });

    // Add event listener for close button
    document.getElementById('closeCustomDataInputButton').addEventListener('click', () => {
        customDataInputPopup.remove(); // Close the custom data input popup when the close button is clicked
    });
}


// Function to handle form submission
async function handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission
    const submitButton = document.querySelector('#selectForm button[type="submit"]');
    submitButton.textContent = "Loading..."; // Change the button text to "Loading..."
    const highlightedText = getHighlightedText(); // Get highlighted text
    try {
        const selectedOption = document.getElementById('optionsDropdown').value;
        if (selectedOption === "customButton") {
            showCustomDataInputPopup(highlightedText);
        } else {
            const result = await handleOptionSelection(highlightedText); // Wait for the option selection to complete
            console.log(`result is : ${result}`);
            // Simulate loading for 2 minutes (120 seconds)
            await new Promise(resolve => setTimeout(resolve, 100));
            hidePopup(); // Hide the loading popup after 2 minutes
            if (result !== null) {
                showResultPopup(result); // Show the result popup if result is not null
            } else {
                showResultPopup('Error: Failed to fetch data'); // Show error message if result is null
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showResultPopup('Error: Failed to fetch data');
    } finally {
        submitButton.textContent = "Submit"; // Reset the button text
    }
}


// Listen for mouseup event on the document
document.addEventListener('mouseup', (event) => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
        showPopup();
    } else {
        hidePopup();
    }
});

// Create the popup element
const popup = document.createElement('div');
popup.id = 'customPopup';
popup.style.position = 'fixed';
popup.style.backgroundColor = '#f9f9f9';
popup.style.padding = '20px';
popup.style.borderRadius = '12px';
popup.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
popup.style.zIndex = '9999';
popup.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
popup.style.maxWidth = '300px';
popup.style.transition = 'transform 0.3s ease';
popup.style.backgroundImage = 'linear-gradient(135deg, #c9d6df, #e4ecf1)';
popup.style.color = '#222';

// Add content to the popup
popup.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro&display=swap');
        select#optionsDropdown {
            margin-bottom: 20px;
            padding: 12px 24px;
            font-size: 18px;
        }
        select#optionsDropdown option {
            font-size: 18px;
        }
    </style>
    <h2 style="margin-top: 0; color: black; font-weight: bold; font-size: 22px; font-family: 'SF Pro', sans-serif;"><i class="fas fa-history"></i> <span style="color: black;">Historical Data</span> Generator</h2>
    <p style="margin-bottom: 25px; font-size: 18px;">Select an option:</p>
    <form id="selectForm" style="margin-bottom: 25px;">
        <select id="optionsDropdown" onchange="toggleCustomQueryInput()">
            <option value="dictionaryButton">Dictionary Lookup</option>
            <option value="historicalButton">Historical Details</option>
            <option value="customButton">Custom Search</option>
        </select>
        <input type="text" id="customQueryInput" placeholder="Enter your custom query" style="margin-bottom: 10px; padding: 8px 12px; width: calc(100% - 24px); font-size: 16px; border: 1px solid #ccc; border-radius: 4px; display: none;">
        <button type="submit" style="padding: 12px 24px; background-color: #8BC34A; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: 'SF Pro', sans-serif; font-size: 18px;">Submit</button>
    </form>
    <button id="closeButton" style="position: absolute; top: 15px; right: 15px; width: 20px; height: 20px; background-color: rgba(255, 59, 48, 0.9); color: white; border: none; border-radius: 50%; padding: 0; cursor: pointer; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2); font-size: 16px;">&#10006;</button>
`;


// Append the popup to the document body
document.body.appendChild(popup);

// Create the result popup element
const resultPopup = document.createElement('div');
resultPopup.id = 'resultPopup';
resultPopup.style.position = 'fixed';
resultPopup.style.backgroundColor = '#f9f9f9';
resultPopup.style.padding = '20px';
resultPopup.style.borderRadius = '12px';
resultPopup.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
resultPopup.style.zIndex = '9999';
resultPopup.style.fontFamily = 'Arial, sans-serif';
resultPopup.style.top = '20px'; // Position from the top
resultPopup.style.right = '20px'; // Position from the right
resultPopup.style.display = 'none'; // Initially hide the popup
resultPopup.style.width = '300px'; // Set the width to match the input popup

// Add content to the result popup
resultPopup.innerHTML = `
    <h2 style="margin-top: 0;">Result</h2>
    <p id="resultContent">Result goes here...</p>
    <button id="closeResultButton" style="margin-top: 10px; padding: 10px 20px; background-color: #8BC34A; color: white; border: none; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">Close</button>
`;

// Append the result popup to the document body
document.body.appendChild(resultPopup);

// Get reference to the result content element
const resultContent = document.getElementById('resultContent');

// Add event listener for close button in the popup
const closeButton = document.getElementById('closeButton');
if (closeButton) {
    closeButton.addEventListener('click', () => {
        hidePopup();
    });
}

// Add event listener for close button in the result popup
const closeResultButton = document.getElementById('closeResultButton');
if (closeResultButton) {
    closeResultButton.addEventListener('click', () => {
        hideResultPopup();
    });
}

// Add event listener for form submission
const selectForm = document.getElementById('selectForm');
if (selectForm) {
    selectForm.addEventListener('submit', handleSubmit);
}

// Function to toggle the display of the custom query input based on option selection
function toggleCustomQueryInput() {
    const optionsDropdown = document.getElementById('optionsDropdown');
    const customQueryInput = document.getElementById('customQueryInput');

    if (optionsDropdown.value === 'customButton') {
        customQueryInput.style.display = 'block';
    } else {
        customQueryInput.style.display = 'none';
    }
}
