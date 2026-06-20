import ValkeyClient from "./valkey";

const client = new ValkeyClient(process.env.VALKEY_URL);

export default client;
