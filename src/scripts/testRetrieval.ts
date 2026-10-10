import { searchKnowledge } from "../app/modules/chatbot/chatbot.services";


async function main() {
  const results = await searchKnowledge(
    "What happens to my streak if I do not complete a task?"
  );

  for (const result of results) {
    console.log("\n==============================");
    console.log("SOURCE:", result.source);
    console.log("SIMILARITY:", result.score);
    console.log("CONTENT:");
    console.log(result.content);
  }
}

main().catch(console.error);
