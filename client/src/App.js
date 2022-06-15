import React, { useState, useEffect } from 'react';
import './App.css';

const DOC_URL = 'https://www.cityoftulsa.org/apps/COTDisplayDocument/?DocumentType=Agenda&DocumentIdentifiers=';

function App() {
  const [data = [], setData] = useState();

  useEffect(() => {
    async function fetchData() {
      const result = await (await fetch(
        'https://raw.githubusercontent.com/tulsa-policy-institute/tulsa-civic-meetup/master/data/upcoming.json',
      )).json();

      setData(result.reverse());
    }

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Upcoming:</h1>
      <ul>
        {data.map((d, i) => <li key={i}>
            {d.Board_Name}: {d.Meeting_Date} &nbsp;
            <a
            href={`${DOC_URL}${d.Agenda_ID}`}
            target='_blank'
            rel="noreferrer"
          >
            (View Agenda)
          </a>
        </li>)}
      </ul>
    </div>
  );
}

export default App;
