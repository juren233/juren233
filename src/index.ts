import { createApp, createD1Repository } from "./app";

export default {
  fetch(request: Request, env: Env, executionContext: ExecutionContext) {
    const app = createApp(createD1Repository(env.DB));
    return app.fetch(request, env, executionContext);
  },
};
