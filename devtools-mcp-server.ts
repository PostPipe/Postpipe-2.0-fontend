import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer, { Browser, Page } from "puppeteer";

const server = new Server(
  { name: "chrome-devtools-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

let browser: Browser | null = null;
let page: Page | null = null;

// Store captured logs and requests
let consoleLogs: string[] = [];
let networkRequests: any[] = [];

async function getPage(): Promise<Page> {
  if (!browser) {
    browser = await puppeteer.launch({ 
      headless: false, // Set to true if you don't want the browser UI
      devtools: true   // Opens DevTools automatically
    });
    page = await browser.newPage();
    
    // 1. Capture Console Errors & Logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(`[ERROR]: ${msg.text()}`);
      } else {
        consoleLogs.push(`[${msg.type().toUpperCase()}]: ${msg.text()}`);
      }
    });

    // 2. Inspect Network Requests
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    page.on('response', response => {
      const req = networkRequests.find(r => r.url === response.url());
      if (req) {
        req.status = response.status();
      }
    });
  }
  return page!;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "navigate",
        description: "Navigate to a URL",
        inputSchema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      {
        name: "get_captured_errors",
        description: "Get all console errors and logs captured during the session",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_network_activity",
        description: "Get captured network requests, filterable by status",
        inputSchema: {
          type: "object",
          properties: { 
            onlyErrors: { type: "boolean", description: "Only return 400+ status codes" } 
          },
        },
      },
      {
        name: "take_screenshot",
        description: "Take a full page screenshot",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "analyze_dom",
        description: "Analyze DOM state and extract specific elements",
        inputSchema: {
          type: "object",
          properties: { selector: { type: "string" } },
          required: ["selector"],
        },
      },
      {
        name: "run_ux_check",
        description: "Run an automated UX check (e.g., check for broken images, overlapping text)",
        inputSchema: { type: "object", properties: {} },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const p = await getPage();

  switch (request.params.name) {
    case "navigate": {
      const { url } = request.params.arguments as any;
      await p.goto(url, { waitUntil: "networkidle0" });
      return { content: [{ type: "text", text: `Navigated to ${url}` }] };
    }

    case "get_captured_errors": {
      return { 
        content: [{ type: "text", text: JSON.stringify(consoleLogs, null, 2) }] 
      };
    }

    case "get_network_activity": {
      const { onlyErrors } = request.params.arguments as any;
      let logs = networkRequests;
      if (onlyErrors) {
        logs = logs.filter(req => req.status >= 400);
      }
      return { 
        content: [{ type: "text", text: JSON.stringify(logs, null, 2) }] 
      };
    }

    case "take_screenshot": {
      const screenshot = await p.screenshot({ encoding: "base64", fullPage: true });
      return {
        content: [
          { type: "text", text: "Screenshot captured" },
          { type: "image", data: screenshot as string, mimeType: "image/png" }
        ],
      };
    }

    case "analyze_dom": {
      const { selector } = request.params.arguments as any;
      const elements = await p.$$eval(selector, els => 
        els.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          classes: el.className
        }))
      );
      return { content: [{ type: "text", text: JSON.stringify(elements, null, 2) }] };
    }

    case "run_ux_check": {
      // Basic UX check example: Find images without alt tags or broken links
      const issues = await p.evaluate(() => {
        const found: string[] = [];
        document.querySelectorAll('img').forEach(img => {
          if (!img.alt) found.push(`Image missing alt tag: ${img.src}`);
        });
        document.querySelectorAll('a').forEach(a => {
          if (!a.href || a.getAttribute('href') === '#') found.push(`Empty or broken link: ${a.textContent}`);
        });
        return found;
      });
      return { content: [{ type: "text", text: issues.length ? issues.join('\n') : "No basic UX issues found!" }] };
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
