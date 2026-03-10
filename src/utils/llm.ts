import OpenAI from "openai";

/**
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
