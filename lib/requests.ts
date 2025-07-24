

export async function fetchCompressed(
  input: string | URL | globalThis.Request,
  init: Omit<RequestInit, "body"> & {
    body: string;
  },
) {
  // Create a readable stream from the JSON string
  const inputStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(init.body));
      controller.close();
    },
  });

  // Compress the stream using pipeThrough
  const compressedStream = inputStream.pipeThrough(
    new CompressionStream("gzip"),
  );

  // Read the compressed stream into a buffer
  const reader = compressedStream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  // Combine chunks into a single Uint8Array
  const totalLength = chunks.reduce(
    (acc, chunk) => acc + chunk.length,
    0,
  );
  const compressedData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressedData.set(chunk, offset);
    offset += chunk.length;
  }

  await fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "gzip",
    },
    body: compressedData,
  });
}

