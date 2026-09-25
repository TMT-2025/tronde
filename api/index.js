import { handleExamMixerRequest } from "../dist/server/app-server.js";

export default async function handler(req, res) {
  await handleExamMixerRequest(req, res);
}
