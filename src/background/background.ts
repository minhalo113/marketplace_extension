chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "UPLOAD_REVIEWS") {
        console.log("Sending to backendd...");

        fetch(request.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.payload)
        })
            .then(res => {
                console.log(res);
                return res.json();
            })
            .then(data => {
                console.log(data);
                sendResponse({ success: true, data })
            })
            .catch(err => {
                console.error("STRATEGIC BREACH:", err.name, err.message);
                sendResponse({ success: false, error: err.message });
            });
        console.log("Sent.");

        return true;
    }
});