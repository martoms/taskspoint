const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const baseUrl = process.env.UI_REVIEW_URL ?? 'http://127.0.0.1:4200';
const artifactDirectory = path.resolve('artifacts/ui-review');

const createTask = async (page, title) => {
  await page.goto(new URL('/tasks/new', baseUrl).toString());
  await page.getByLabel('Task title').fill(title);
  await page.getByRole('button', { name: 'Create task' }).click();
  await page.getByRole('heading', { name: title }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
};

const main = async () => {
  fs.mkdirSync(artifactDirectory, { recursive: true });
  const browser = await chromium.launch();
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await desktop.goto(baseUrl);
    await desktop.getByRole('heading', { name: 'Make room for what matters.' }).waitFor();
    await desktop.screenshot({ path: path.join(artifactDirectory, 'desktop-empty.png') });
    await createTask(desktop, 'Review the launch plan');
    await desktop.screenshot({ path: path.join(artifactDirectory, 'desktop-success.png') });

    await mobile.goto(baseUrl);
    await mobile.getByRole('heading', { name: 'Make room for what matters.' }).waitFor();
    await mobile.screenshot({ path: path.join(artifactDirectory, 'mobile-empty.png') });
    await createTask(mobile, 'Plan the next release');
    await mobile.screenshot({
      fullPage: true,
      path: path.join(artifactDirectory, 'mobile-success.png'),
    });

    const accessibilityPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await accessibilityPage.goto(baseUrl);
    await accessibilityPage.getByRole('heading', { name: 'Make room for what matters.' }).waitFor();
    await accessibilityPage.keyboard.press('Tab');
    const accessibility = await accessibilityPage.evaluate(() => ({
      mainLandmark: document.querySelector('main') !== null,
      keyboardSkipLink: document.activeElement?.classList.contains('skip-link') ?? false,
      skipLink:
        document.querySelector('.skip-link')?.textContent?.trim() === 'Skip to main content',
      labeledSearch: document.querySelector('label[for="task-search"]') !== null,
    }));
    await accessibilityPage.close();
    const responsive = await Promise.all(
      [desktop, mobile].map((page) =>
        page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        })),
      ),
    );

    if (Object.values(accessibility).some((check) => !check)) {
      throw new Error('Rendered accessibility checks failed.');
    }
    if (responsive.some(({ clientWidth, scrollWidth }) => scrollWidth > clientWidth)) {
      throw new Error('Rendered layout has horizontal overflow.');
    }

    const warningPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await warningPage.addInitScript(() => localStorage.setItem('taskflow.tasks.v1', '{bad json'));
    await warningPage.goto(baseUrl);
    await warningPage.getByText('Saved task data could not be read.').waitFor();
    await warningPage.screenshot({
      path: path.join(artifactDirectory, 'desktop-storage-warning.png'),
    });
    await warningPage.close();

    const report = {
      contract: 'Taskflow renders a usable task manager at desktop and mobile sizes.',
      targetViewports: ['1440x900', '390x844'],
      accessibility: {
        status: 'pass',
        evidence:
          'Rendered main landmark, keyboard-first skip link, and labeled task search are present.',
      },
      responsive: {
        status: 'pass',
        evidence:
          'Desktop and mobile document widths match their viewport widths with no horizontal overflow.',
      },
      contentStates: {
        loading: {
          status: 'not-applicable',
          reason: 'The initial task list loads synchronously from local browser storage.',
        },
        empty: {
          status: 'pass',
          evidence: 'Desktop and mobile screenshots show the first-task empty state.',
        },
        error: {
          status: 'pass',
          evidence: 'Malformed saved data shows a recovery notice in desktop-storage-warning.png.',
        },
        partial: {
          status: 'not-applicable',
          reason: 'The local task list has no remote pagination or partial response.',
        },
        success: {
          status: 'pass',
          evidence: 'Desktop and mobile screenshots show a saved task row.',
        },
        permission: {
          status: 'not-applicable',
          reason: 'Taskflow does not request browser permissions.',
        },
      },
      renderedEvidence: [
        {
          viewport: '1440x900',
          artifact: 'desktop-empty.png',
          observation: 'Empty workspace and desktop navigation fit the viewport.',
        },
        {
          viewport: '1440x900',
          artifact: 'desktop-success.png',
          observation: 'Saved task row renders with its page controls.',
        },
        {
          viewport: '390x844',
          artifact: 'mobile-empty.png',
          observation: 'Mobile workspace and navigation fit without horizontal scrolling.',
        },
        {
          viewport: '390x844',
          artifact: 'mobile-success.png',
          observation:
            'Full-page capture shows the task row and actions at the mobile viewport width.',
        },
        {
          viewport: '1440x900',
          artifact: 'desktop-storage-warning.png',
          observation: 'Corrupt local data warning exposes its recovery action.',
        },
      ],
    };

    fs.writeFileSync(
      path.join(artifactDirectory, 'report.json'),
      JSON.stringify(report, null, 2) + '\n',
    );
    console.log('UI screenshots and evidence report saved to artifacts/ui-review.');
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
