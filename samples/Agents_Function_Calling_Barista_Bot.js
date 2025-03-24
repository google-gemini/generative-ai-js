import readline from "readline";


class CoffeeOrderBot {
    constructor() {
        this.order = [];
        this.placedOrder = [];
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    addToOrder(drink, modifiers = []) {
        this.order.push({ drink, modifiers });
    }

    getOrder() {
        return this.order;
    }

    removeItem(n) {
        if (n > 0 && n <= this.order.length) {
            return this.order.splice(n - 1, 1)[0].drink;
        }
        return "Invalid item number.";
    }

    clearOrder() {
        this.order = [];
    }

    confirmOrder(callback) {
        console.log("Your order:");
        if (this.order.length === 0) {
            console.log("  (no items)");
        } else {
            this.order.forEach((item, index) => {
                console.log(`${index + 1}. ${item.drink}`);
                if (item.modifiers.length) {
                    console.log(`   - ${item.modifiers.join(", ")}`);
                }
            });
        }
        this.rl.question("Is this correct? (yes/no) ", (answer) => {
            callback(answer.trim().toLowerCase() === "yes");
        });
    }

    placeOrder() {
        this.placedOrder = [...this.order];
        this.clearOrder();
        return Math.floor(Math.random() * 10) + 1;
    }

    startOrdering() {
        console.log("Welcome to Barista Bot! Type 'menu' to see options.");
        this.askForOrder();
    }

    askForOrder() {
        this.rl.question("> ", (input) => {
            const args = input.split(" ");
            const command = args.shift().toLowerCase();

            if (command === "menu") {
                console.log("MENU: Espresso, Americano, Cold Brew, Latte, Cappuccino, Mocha");
            } else if (command === "add") {
                const drink = args.join(" ");
                if (drink) {
                    this.addToOrder(drink);
                    console.log(`${drink} added to your order.`);
                } else {
                    console.log("Please specify a drink.");
                }
            } else if (command === "remove") {
                const index = parseInt(args[0]);
                if (!isNaN(index)) {
                    console.log(`${this.removeItem(index)} removed.`);
                } else {
                    console.log("Invalid number.");
                }
            } else if (command === "clear") {
                this.clearOrder();
                console.log("Order cleared.");
            } else if (command === "confirm") {
                this.confirmOrder((confirmed) => {
                    if (confirmed) {
                        const eta = this.placeOrder();
                        console.log(`Order placed! Estimated time: ${eta} minutes.`);
                        this.rl.close();
                    } else {
                        console.log("Modify your order and confirm again.");
                        this.askForOrder();
                    }
                });
                return;
            } else {
                console.log("Unknown command. Try 'menu', 'add', 'remove', 'clear', or 'confirm'.");
            }
            this.askForOrder();
        });
    }
}

const bot = new CoffeeOrderBot();
bot.startOrdering();
