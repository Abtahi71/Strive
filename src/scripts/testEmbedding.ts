import { createEmbedding } from "../app/modules/chatbot/chatbot.services";


async function main() {
  const embedding = await createEmbedding(
    "Strive helps users track activities and tasks."
  );

  console.log("Embedding length:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
}

main().catch(console.error);
