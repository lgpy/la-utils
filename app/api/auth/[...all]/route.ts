import { auth } from "@/lib/auth.server"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

let methods = {
  POST: async (request: Request) => {
    return new Response("POST handler not implemented");
  },
  GET: async (request: Request) => {
    return new Response("GET handler not implemented");
  }
};

if (auth !== null) {
  methods = toNextJsHandler(auth);
}

export const { POST, GET } = methods;
