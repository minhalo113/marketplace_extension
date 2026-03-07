import OpenAI from "openai";

/**
 * A utility function to call OpenAI GPT models.
 * It retrieves the API key from `chrome.storage.local`.
 * If no key is found, it throws an error.
 * 
 * @param prompt The prompt to send to the AI.
 * @param model The model to use (defaults to 'gpt-4o-mini').
 * @returns The text response from the model.
 */
export async function askGPT(prompt: string, model: string = "gpt-4o-mini"): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openaiApiKey'], async (result) => {
            const apiKey = result.openaiApiKey;

            if (!apiKey) {
                console.error("OpenAI API key not found in storage. Please set 'openaiApiKey' in chrome.storage.local.");
                reject(new Error("Missing OpenAI API Key"));
                return;
            }

            try {
                const openai = new OpenAI({
                    apiKey: String(apiKey),
                    // The SDK throws an error if it detects it's running in a browser environment
                    // since you might be leaking your key. We set this flag to bypass the error 
                    // since this is a browser extension and the key is fetched locally.
                    dangerouslyAllowBrowser: true
                });

                const completion = await openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: model,
                });

                const responseText = completion.choices[0]?.message?.content || "";
                resolve(responseText);

            } catch (error) {
                console.error("Error calling OpenAI:", error);
                reject(error);
            }
        });
    });
}
