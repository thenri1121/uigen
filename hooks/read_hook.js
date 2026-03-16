async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  // readPath is the path to the file that Claude is trying to read
  const target =
    toolArgs.tool_input?.file_path ||
    toolArgs.tool_input?.path ||
    toolArgs.tool_input?.command ||
    "";

  if (target.includes(".env")) {
    console.error("You cannot access the .env file");
    process.exit(2);
  }
}

main();
