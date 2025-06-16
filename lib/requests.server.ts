'server only'

import { gunzip } from 'node:zlib';

export async function getUncompressedBody(
  request: Request,
): Promise<unknown> {

  const contentEncoding = request.headers.get("content-encoding");
  let body: unknown;

  if (contentEncoding === "gzip") {
    // Handle compressed data using Node.js built-in zlib
    const arrayBuffer = await request.arrayBuffer();
    const compressed = new Uint8Array(arrayBuffer);
    const decompressed = await new Promise<Buffer>((resolve, reject) => {
      gunzip(compressed, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    body = JSON.parse(decompressed.toString("utf-8"));
  } else {
    // Handle uncompressed data (fallback)
    body = await request.json();
  }

  return body;
}
