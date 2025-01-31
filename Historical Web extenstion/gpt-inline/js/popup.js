document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const closeButton = document.getElementById('closeButton');
    
    closeButton.addEventListener('click', function() {
        window.close(); // Close the popup window
    });

    saveButton.addEventListener('click', function () {
        const apiKey = apiKeyInput.value;

        if (apiKey.trim() !== '') {
            chrome.storage.local.set({"gptApiKey": apiKey}, function() {
                saveButton.innerText = 'Saved Successfully';
                saveButton.disabled = true;
            });
        } else {
            apiKeyInput.classList.add('red-placeholder'); // Add red-placeholder class
            apiKeyInput.placeholder = 'Enter your API key'; // Change placeholder text
        }
    });

    // Remove red-placeholder class when input is focused
    apiKeyInput.addEventListener('focus', function() {
        apiKeyInput.classList.remove('red-placeholder');
    });
});
