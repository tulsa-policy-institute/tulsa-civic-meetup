const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

async function scrape() {
  console.log('pulling');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.cityoftulsa.org/government/meeting-agendas');
  await page.waitForSelector('tbody');
  const ids = await page.$$eval('tbody', tbodies => tbodies.map(t => t.id.split('-').map(x => parseInt(x))));
  browser.close();

  const meetings = await Promise.all(ids.map(async ([boardID, subCommitteeID]) => {
    const { data } = await axios.post('https://www.cityoftulsa.org/umbraco/surface/AgendasByBoard/GetAgendasByBoard/', {
      boardID,
      subCommitteeID,
    });

    return data;
  }));

  const flattened = meetings.reduce((acc, curr) => [...acc, ...curr], []);

  fs.writeFileSync('data/meetings.json', JSON.stringify(flattened));
}

scrape();
