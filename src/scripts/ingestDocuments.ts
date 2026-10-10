import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { prisma } from "../app/lib/prisma";
import { createEmbedding } from "../app/modules/chatbot/chatbot.services";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCUMENTS_DIR = path.join(__dirname, "../documents");

function Sleep(ms:number){
    return new Promise((resolve)=>setTimeout(resolve,ms))

}

function chunkText(text: string, chunkSize = 1000, overlap = 200) {
  const chunks: string[] = [];

  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;

    chunks.push(text.slice(start, end));

    start += chunkSize - overlap;
  }

  return chunks;
}

async function main() {
  const files = fs
    .readdirSync(DOCUMENTS_DIR)
    .filter((file) => file.endsWith(".md"));

  console.log(`Found ${files.length} documents`);

  for (const file of files) {
    console.log(`\nProcessing: ${file}`);

    const filePath = path.join(DOCUMENTS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");

    const chunks = chunkText(content);

    console.log(`Created ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      console.log(`Embedding chunk ${i + 1}/${chunks.length}`);

      const embedding = await createEmbedding(chunk);

      const vector = `[${embedding.join(",")}]`;

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO knowledge_chunks
        (source, content, embedding)
        VALUES ($1, $2, $3::vector)
        `,
        file,
        chunk,
        vector
      );

      await Sleep(4000);
    }
  }

  console.log("\nFinished ingesting documents.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
