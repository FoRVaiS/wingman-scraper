import puppeteer, { BrowserContext } from 'puppeteer';

export const executePipeline = async (agent, pipeline) => {
  agent.start();
  await pipeline(agent);
  agent.complete();
};

type AgentSettings = Parameters<typeof puppeteer['launch']>[0];

const destroyContext = (context: BrowserContext) => context.close();

const createAgent = async (
  agentSettings: AgentSettings,
  onStart: (context: BrowserContext) => void,
  onComplete: (context: BrowserContext) => void,
) => {
  const browser = await puppeteer.launch(agentSettings);

  const context = await browser.browserContexts[0];

  const executePipeline = executePipeline.bind(null, context);
  const start = onStart.bind(null, context);
  const complete = onComplete.bind(null, context);
  const destroy = destroyContext.bind(null, context);

  return {
    executePipeline,
    start,
    complete,
    destroy,
  };
};

export const createHeadlessAgent = createAgent.bind(null, {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
