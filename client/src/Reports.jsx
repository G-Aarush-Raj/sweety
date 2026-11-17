import { SLOTS, prettyDate } from './api.js';

const rangeLabel = ({ from, to }) => (from === to ? prettyDate(from) : `${prettyDate(from)} – ${prettyDate(to)}`);

function Stats({ title, report, children }) {
  return (
    <section className="card report">
      <h3>{title}</h3>
      <p className="range">{rangeLabel(report.range)}</p>
      {report.count === 0 ? (
        <p className="empty">No readings in this period yet. Add one to see your numbers here.</p>
      ) : (
        <>
          <dl className="stats">
            <div><dt>Highest</dt><dd>{report.highest}</dd></div>
            <div><dt>Lowest</dt><dd>{report.lowest}</dd></div>
            <div><dt>Average</dt><dd>{report.average.toFixed(1)}</dd></div>
            <div><dt>Readings</dt><dd>{report.count}</dd></div>
          </dl>
          {children}
        </>
      )}
    </section>
  );
}

export default function Reports({ reports }) {
  if (!reports) return <p>Loading reports…</p>;
  return (
    <div className="reports">
      <Stats title="Daily report" report={reports.daily}>
        <ul className="slot-list">
          {reports.daily.readings.map((r) => (
            <li key={r.id}><span>{SLOTS[r.slot]}</span><strong>{r.value} mg/dl</strong></li>
          ))}
        </ul>
      </Stats>
      <Stats title="Month to date" report={reports.monthToDate} />
      <Stats title="Previous month" report={reports.monthly} />
    </div>
  );
}
