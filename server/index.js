const path = require("path");
const envPath =
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, `.env.${process.env.NODE_ENV}`)
    : path.join(__dirname, ".env");
require("dotenv").config({ path: envPath });

// Fail fast if sharp (used by @xenova/transformers for native embeddings) is broken
try {
  require("sharp");
} catch (err) {
  if (err.code === "MODULE_NOT_FOUND" || /sharp.*\.node/.test(err.message)) {
    console.error(
      "\n[FATAL] The 'sharp' module could not be loaded. Document embedding will fail.\n" +
        "Fix: In the server folder run:  npm rebuild sharp\n" +
        "Then restart the server.\n"
    );
    process.exit(1);
  }
  throw err;
}

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { reqBody } = require("./utils/http");
const { systemEndpoints } = require("./endpoints/system");
const { workspaceEndpoints } = require("./endpoints/workspaces");
const { chatEndpoints } = require("./endpoints/chat");
const { embeddedEndpoints } = require("./endpoints/embed");
const { embedManagementEndpoints } = require("./endpoints/embedManagement");
const { getVectorDbClass } = require("./utils/helpers");
const { adminEndpoints } = require("./endpoints/admin");
const { inviteEndpoints } = require("./endpoints/invite");
const { utilEndpoints } = require("./endpoints/utils");
const { developerEndpoints } = require("./endpoints/api");
const { extensionEndpoints } = require("./endpoints/extensions");
const { bootHTTP, bootSSL } = require("./utils/boot");
const { workspaceThreadEndpoints } = require("./endpoints/workspaceThreads");
const { documentEndpoints } = require("./endpoints/document");
const { agentWebsocket } = require("./endpoints/agentWebsocket");
const app = express();
const apiRouter = express.Router();
const FILE_LIMIT = "3GB";

app.use(cors({ origin: true }));
app.use(bodyParser.text({ limit: FILE_LIMIT }));
app.use(bodyParser.json({ limit: FILE_LIMIT }));
app.use(
  bodyParser.urlencoded({
    limit: FILE_LIMIT,
    extended: true,
  })
);

if (!!process.env.ENABLE_HTTPS) {
  bootSSL(app, process.env.SERVER_PORT || 3001);
} else {
  require("express-ws")(app); // load WebSockets in non-SSL mode.
}

app.use("/api", apiRouter);
systemEndpoints(apiRouter);
extensionEndpoints(apiRouter);
workspaceEndpoints(apiRouter);
workspaceThreadEndpoints(apiRouter);
chatEndpoints(apiRouter);
adminEndpoints(apiRouter);
inviteEndpoints(apiRouter);
embedManagementEndpoints(apiRouter);
utilEndpoints(apiRouter);
documentEndpoints(apiRouter);
agentWebsocket(apiRouter);
developerEndpoints(app, apiRouter);

// Externally facing embedder endpoints
embeddedEndpoints(apiRouter);

if (process.env.NODE_ENV !== "development") {
  app.use(
    express.static(path.resolve(__dirname, "public"), {
      extensions: ["js"],
      setHeaders: (res) => {
        // Disable I-framing of entire site UI
        res.removeHeader("X-Powered-By");
        res.setHeader("X-Frame-Options", "DENY");
      },
    })
  );

  app.use("/", function (_, response) {
    response.sendFile(path.join(__dirname, "public", "index.html"));
  });

  app.get("/robots.txt", function (_, response) {
    response.type("text/plain");
    response.send("User-agent: *\nDisallow: /").end();
  });
} else {
  // In development the frontend is served by Vite (default port 3000).
  // Redirect browser requests to the app so the landing page is reachable.
  const frontendDevUrl =
    process.env.FRONTEND_DEV_URL || "http://localhost:3000";
  app.get("*", function (request, response, next) {
    if (request.path.startsWith("/api")) return next();
    const url = new URL(request.path || "/", frontendDevUrl);
    url.search = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
    response.redirect(302, url.toString());
  });

  // Debug route for development connections to vectorDBs
  apiRouter.post("/v/:command", async (request, response) => {
    try {
      const VectorDb = getVectorDbClass();
      const { command } = request.params;
      if (!Object.getOwnPropertyNames(VectorDb).includes(command)) {
        response.status(500).json({
          message: "invalid interface command",
          commands: Object.getOwnPropertyNames(VectorDb),
        });
        return;
      }

      try {
        const body = reqBody(request);
        const resBody = await VectorDb[command](body);
        response.status(200).json({ ...resBody });
      } catch (e) {
        // console.error(e)
        console.error(JSON.stringify(e));
        response.status(500).json({ error: e.message });
      }
      return;
    } catch (e) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });
}

app.all("*", function (_, response) {
  response.sendStatus(404);
});

// In non-https mode we need to boot at the end since the server has not yet
// started and is `.listen`ing.
if (!process.env.ENABLE_HTTPS) bootHTTP(app, process.env.SERVER_PORT || 3001);
