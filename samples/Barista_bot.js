import "dotenv/config"; // Load .env variables
import readline from "readline"; // For terminal input
import { GoogleGenerativeAI } from "@google/generative-ai"; // Gemini SDK Setup

// Initialize Gemini client with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Export the generative model (Gemini Pro)
const model = genAI.getGenerativeModel({ model: "gemini-pro" });


// Store the current order
let order = [];

/**
 * Add a drink to the order with optional modifiers (like oat milk, caramel)
 */
function addToOrder(drink, modifiers = []) {
    order.push({ drink, modifiers });
    return `✅ Added ${drink}${modifiers.length ? " with " + modifiers.join(", ") : ""}`;
}

/**
 * Get the full text summary of the order
 */
function getOrderText() {
    if (order.length === 0) return "📝 You haven't added anything yet.";
    return order
        .map(({ drink, modifiers }, i) =>
            `${i + 1}. ${drink}${modifiers.length ? " (" + modifiers.join(", ") + ")" : ""}`
        )
        .join("\n");
}

/**
 * Clear the current order
 */
function clearOrder() {
    order = [];
    return "🧹 Order cleared.";
}

/**
 * Place the order, get a random ETA, then clear it
 */
function placeOrder() {
    const eta = Math.floor(Math.random() * 10) + 1;
    const summary = getOrderText();
    clearOrder();
    return `✅ Order placed!\n📝 Summary:\n${summary}\n🚚 ETA: ${eta} minutes.`;
}



// Setup CLI input/output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Main loop
async function main() {
    console.log("☕ Welcome to Barista Bot (powered by Gemini)\nType 'exit' to quit.\n");

    while (true) {
        const input = await new Promise((res) => rl.question("> ", res));

        if (input.toLowerCase() === "exit") break;

        try {
            // Ask Gemini to interpret the user's command
            const result = await model.generateContent(`
                This is a barista bot. The user said: "${input}". 
                Respond in lowercase with a simple command:
- "add [drink] with [modifiers]" (e.g. add latte with oat milk)
- "get order"
- "clear"
- "place order"
Respond with only the command.
`);

            const aiResponse = result.response.text().toLowerCase().trim();
            console.log(`🤖 Gemini says: ${aiResponse}`);

            let output = "🤔 I didn't understand that.";

            // Parse Gemini's instruction
            if (aiResponse.startsWith("add")) {
                const match = aiResponse.match(/add\s(.+?)(?:\swith\s(.+))?$/);
                if (match) {
                    const drink = match[1].trim();
                    const mods = match[2]?.split(" and ").map((m) => m.trim()) ?? [];
                    output = addToOrder(drink, mods);
                }
            } else if (aiResponse.includes("get order")) {
                output = getOrderText();
            } else if (aiResponse.includes("clear")) {
                output = clearOrder();
            } else if (aiResponse.includes("place order")) {
                output = placeOrder();
            }

            console.log(output + "\n");
        } catch (err) {
            console.error("❌ Error:", err.message);
        }
    }

    rl.close();
}

main();
// 📦 Install Dependencies

// npm init -y
// npm install @google/generative-ai dotenv
// 🧪 Run the Bot

// ☕ Welcome to Barista Bot (powered by Gemini)
// Type 'exit' to quit.

// > I'd like a cappuccino with oat milk
// 🤖 Gemini says: add cappuccino with oat milk
// ✅ Added cappuccino with oat milk

// > What's my order?
// 🤖 Gemini says: get order
// 1. cappuccino (oat milk)

// > clear it please
// 🤖 Gemini says: clear
// 🧹 Order cleared.

// > give me a mocha with almond milk and caramel
// 🤖 Gemini says: add mocha with almond milk and caramel
// ✅ Added mocha with almond milk and caramel

// > place the order
// 🤖 Gemini says: place order
// ✅ Order placed!
// 📝 Summary:
// 1. mocha (almond milk, caramel)
// 🚚 ETA: 6 minutes.