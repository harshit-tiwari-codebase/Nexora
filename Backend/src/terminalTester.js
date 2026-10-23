import readlineSync from "readline-sync";
import { runSimpleTerminalChat } from "./services/Ai.service.js";
import { runSimpleTerminalEmail } from "./services/email.agent.service.js";

const printHelp = () => {
  console.log("Usage:");
  console.log("  node src/terminalTester.js chat \"your prompt\"");
  console.log("  node src/terminalTester.js email \"recipient@example.com\" \"your prompt\" \"Name\"");
  console.log("  node src/terminalTester.js");
};

const ask = (question) => readlineSync.question(question).trim();

const runInteractiveMode = async () => {
  while (true) {
    console.log("\nSimple terminal test mode");
    console.log("1) Test AI chat");
    console.log("2) Test email sending");
    console.log("3) Exit");

    const choice = readlineSync.keyInSelect(["Test AI chat", "Test email sending", "Exit"], "Choose an option:", { cancel: false });

    if (choice === 0) {
      const prompt = ask("Enter AI prompt: ");
      await runSimpleTerminalChat(prompt || "Hello from terminal test mode");
    } else if (choice === 1) {
      const to = ask("Enter recipient email: ");
      const prompt = ask("Enter email prompt: ");
      const recipientName = ask("Enter recipient name (optional): ");
      await runSimpleTerminalEmail({ to, prompt, recipientName });
    } else {
      console.log("Goodbye");
      break;
    }
  }
};

const main = async () => {
  const [command, arg1, arg2, arg3] = process.argv.slice(2);

  if (command === "chat") {
    const prompt = arg1 || "Hello from terminal test mode";
    await runSimpleTerminalChat(prompt);
    return;
  }

  if (command === "email") {
    const to = arg1 || "test@example.com";
    const prompt = arg2 || "This is a simple terminal test email.";
    const recipientName = arg3 || "Tester";
    await runSimpleTerminalEmail({ to, prompt, recipientName });
    return;
  }

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  await runInteractiveMode();
};

main().catch((error) => {
  console.error(error);
});
