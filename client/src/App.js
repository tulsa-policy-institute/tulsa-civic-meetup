import React, { useState, useEffect } from 'react';
import { google, outlook, office365, yahoo, ics } from "calendar-link";
import './App.css';

const DOC_URL = 'https://www.cityoftulsa.org/apps/COTDisplayDocument/?DocumentType=Agenda&DocumentIdentifiers=';

function App() {
  const [data = [], setData] = useState();

  useEffect(() => {
    async function fetchData() {
      const result = await (await fetch(
        'https://raw.githubusercontent.com/tulsa-policy-institute/tulsa-civic-meetup/master/data/upcoming.json',
      )).json();

      const formatted = result.map(r => {
        const event = {
          title: r.Board_Name,
          description: `${DOC_URL}${r.Agenda_ID}`,
          start: `${r.Meeting_Date} ${r.Meeting_Time}`,
          duration: [1, "hour"],
        };

        return {
          ...r,
          calendars: [
            ['google', google(event)],
            ['outlook', outlook(event)],
            ['office365', office365(event)],
            ['yahoo', yahoo(event)],
            ['ics', ics(event)],
          ],
        }
      })
      .reverse()

      setData(formatted);
    }

    fetchData();
  }, []);
  
  return (
    <div className="App">
      <h1>Upcoming:</h1>
      <ul>
        {data.map((d, i) =><li key={i}>
            {d.Board_Name}: <b>{d.Meeting_Date} @ {d.Meeting_Time}</b> &nbsp;
            <a
            href={`${DOC_URL}${d.Agenda_ID}`}
            target='_blank'
            rel="noreferrer"
          >
            (View Agenda)
          </a>
          Add to Calendar: {d.calendars.map((d, i) => <span><a key={i} href={d[1]}>{d[0]}</a> </span>)}
        </li>)}
      </ul>
    </div>
  );
}

export default App;
