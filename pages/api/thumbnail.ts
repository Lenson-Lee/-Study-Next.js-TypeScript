// api 응답 반환

import chromium from 'chrome-aws-lambda';
import { NextApiRequest, NextApiResponse } from 'next';
import playwright from 'playwright-core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const localChromiumPath = process.env.NODE_ENV !== 'development' ? '' : process.env.LOCAL_CHROME_PATH ?? '';
  if (process.env.NODE_ENV !== 'development') {
    //develop이 아니고 production 환경이라면 pretendatd.ttf 파일을 가져와야함
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    await chromium.font(`${baseUrl}/Pretendard-Regular.ttf`);
  }
  const browser = await playwright.chromium.launch({
    args: chromium.args,
    executablePath: process.env.NODE_ENV !== 'development' ? await chromium.executablePath : localChromiumPath,
    headless: process.env.NODE_ENV !== 'development' ? chromium.headless : true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1200,
      height: 675,
    },
  });

  const url = req.query.url as string;
  await page.goto(url);

  const data = await page.screenshot({
    type: 'jpeg',
  });

  await browser.close();

  res.setHeader('Cache-Control', 's-maxage=31536000, public');
  res.setHeader('Content-Type', 'image/jpeg');
  res.end(data);
}
