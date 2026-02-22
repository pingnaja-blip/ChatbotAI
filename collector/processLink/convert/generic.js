const { v4 } = require("uuid");
const {
  PuppeteerWebBaseLoader,
} = require("langchain/document_loaders/web/puppeteer");
const { writeToServerDocuments } = require("../../utils/files");
const { tokenizeString } = require("../../utils/tokenizer");
const { default: slugify } = require("slugify");

function looksLikeErrorPage(content) {
  if (!content || typeof content !== "string") return false;
  const lower = content.trim().toLowerCase();
  const snippet = lower.slice(0, 2000);
  const errorIndicators = [
    "access denied",
    "accessdenied",
    "<code>accessdenied</code>",
    "403 forbidden",
    "403 for forbidden",
    "error code: accessdenied",
    "this xml file does not appear to have any style",
  ];
  return errorIndicators.some((indicator) => snippet.includes(indicator));
}

async function scrapeGenericUrl(link, textOnly = false) {
  console.log(`-- Working URL ${link} --`);
  const content = await getPageContent(link);

  if (!content.length) {
    console.error(`Resulting URL content was empty at ${link}.`);
    return {
      success: false,
      reason: `No URL content found at ${link}.`,
      documents: [],
    };
  }

  if (looksLikeErrorPage(content)) {
    console.error(`URL returned an error page (e.g. Access Denied) at ${link}.`);
    return {
      success: false,
      reason: `The URL returned an "Access Denied" or error page. Check that the link is publicly accessible or use a signed URL.`,
      documents: [],
    };
  }

  if (textOnly) {
    return {
      success: true,
      content,
    };
  }

  const url = new URL(link);
  const filename = (url.host + "-" + url.pathname).replace(".", "_");

  const data = {
    id: v4(),
    url: "file://" + slugify(filename) + ".html",
    title: slugify(filename) + ".html",
    docAuthor: "no author found",
    description: "No description found.",
    docSource: "URL link uploaded by the user.",
    chunkSource: `link://${link}`,
    published: new Date().toLocaleString(),
    wordCount: content.split(" ").length,
    pageContent: content,
    token_count_estimate: tokenizeString(content).length,
  };

  const document = writeToServerDocuments(
    data,
    `url-${slugify(filename)}-${data.id}`
  );
  console.log(`[SUCCESS]: URL ${link} converted & ready for embedding.\n`);
  return { success: true, reason: null, documents: [document] };
}

async function getPageContent(link) {
  try {
    let pageContents = [];
    const loader = new PuppeteerWebBaseLoader(link, {
      launchOptions: {
        headless: "new",
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      async evaluate(page, browser) {
        const result = await page.evaluate(() => document.body.innerText);
        await browser.close();
        return result;
      },
    });

    const docs = await loader.load();

    for (const doc of docs) {
      pageContents.push(doc.pageContent);
    }

    return pageContents.join(" ");
  } catch (error) {
    console.error(
      "getPageContent failed to be fetched by puppeteer - falling back to fetch!",
      error
    );
  }

  try {
    const pageText = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)",
      },
    }).then((res) => res.text());
    return pageText;
  } catch (error) {
    console.error("getPageContent failed to be fetched by any method.", error);
  }

  return null;
}

module.exports = {
  scrapeGenericUrl,
};
