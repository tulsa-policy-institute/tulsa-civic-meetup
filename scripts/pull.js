const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const dataFolder = '../data';
const now = new Date();
const pathToData = path.join(__dirname, dataFolder, fileString(now)) + '.json';
const pathToUpcoming = path.join(__dirname, dataFolder, 'upcoming') + '.json';

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

    if (data) {
      return data.map(d => ({
        ...d,
        boardID,
        subCommitteeID,
      }))
    }

    return data;
  }));

  const flattened = meetings.reduce((acc, curr) => [...acc, ...curr], []);

  fs.writeFileSync(path.resolve(pathToData), JSON.stringify(flattened, null, 2));

  const now = new Date();
  console.log(`Filtering for meetings after ${now}`);

  const upcoming = flattened
    .sort((a, b)  => new Date(b.Meeting_Date) - new Date(a.Meeting_Date))
    .filter(meeting => new Date(meeting.Meeting_Date) >= now);

  fs.writeFileSync(path.resolve(pathToUpcoming), JSON.stringify(upcoming, null, 2));
  console.log('done');
}

scrape();

function fileString(ts) {
  const year = ts.getUTCFullYear();
  const month = (ts.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = ts
    .getUTCDate()
    .toString()
    .toString()
    .padStart(2, '0');
  const name = `${year}-${month}-${day}`;
  return name;
}
