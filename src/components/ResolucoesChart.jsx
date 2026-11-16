// mini gráfico interativo de resoluções (últimos 12 meses)
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api.js';

const W = 1160,
  H = 230,
  ML = 42,
  MR = 18,
  MT = 18,
  MB = 32,
  PW = W - ML - MR,
  PH = H - MT - MB;
const SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];
const LONG = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const nf = (v) => Number(v).toLocaleString('pt-BR');

const parseMonth = (mes) => {
  const [y, m] = String(mes).split('-').map(Number);
  return { y, m: m - 1 };
};
const niceMax = (v) => {
  if (v <= 2) return 2;
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};

export default function ResolucoesChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['resolucoes', 12],
    queryFn: () => api('/tickets/stats/resolucoes'),
  });
  const [hover, setHover] = useState(null),
    [pinned, setPinned] = useState(null);
  const items = useMemo(
    () =>
      (data || []).map((d) => {
        const { y, m } = parseMonth(d.mes);
        return {
          ...d,
          total: Number(d.total) || 0,
          short: SHORT[m],
          full: `${LONG[m]} de ${y}`,
        };
      }),
    [data],
  );
  const total = items.reduce((s, i) => s + i.total, 0);
  const last = items.length ? items[items.length - 1].total : 0;
  const prev = items.length > 1 ? items[items.length - 2].total : 0;
  const diff = last - prev;
  const pct = prev > 0 ? Math.round((diff / prev) * 100) : null;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  const active = hover ?? pinned;
  const max = niceMax(Math.max(1, ...items.map((i) => i.total)));
  const n = items.length;
  const x = (i) => ML + (n <= 1 ? PW / 2 : (i / (n - 1)) * PW);
  const y = (v) => MT + PH - (v / max) * PH;
  const line = items
    .map((it, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(it.total).toFixed(1)}`)
    .join(' ');
  const area = n
    ? `${line} L${x(n - 1).toFixed(1)},${MT + PH} L${x(0).toFixed(1)},${MT + PH} Z`
    : '';
  const ticks = [...new Set([0, Math.round(max / 2), max])];
  const bandStart = (i) => (i === 0 ? ML : (x(i - 1) + x(i)) / 2);
  const bandEnd = (i) =>
    i === n - 1 ? ML + PW : (x(i) + x(i + 1)) / 2;
  const tipLeft =
    active == null ? 0 : Math.min(92, Math.max(8, (x(active) / W) * 100));
  const tipTop =
    active == null ? 0 : Math.max(4, (y(items[active].total) / H) * 100 - 2);

  return (
    <section className="box res-card">
      <h3>
        <span>Resoluções nos últimos 12 meses</span>
        <span className="res-kpis">
          <span className="res-kpi">
            <b>{nf(total)}</b>
            <small>no período</small>
          </span>
          {pct !== null && (
            <span
              className={`res-trend ${trend}`}
              title="Comparação com o mês anterior"
            >
              {`${diff >= 0 ? '▲' : '▼'} ${Math.abs(pct)}%`}
              <small>vs mês anterior</small>
            </span>
          )}
        </span>
      </h3>
      <div className="res-body">
        {isLoading && !items.length ? (
          <div className="res-skeleton" aria-label="Carregando gráfico" />
        ) : isError || !items.length ? (
          <div className="res-empty">
            Não foi possível carregar as resoluções.
          </div>
        ) : (
          <>
            <div
              className="res-plot"
              onMouseLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
            >
              <div className="res-canvas">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  role="img"
                  aria-label={`Gráfico de resoluções dos últimos 12 meses. Total: ${total}. Último mês: ${last}.`}
                >
                <defs>
                  <linearGradient id="resFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" className="res-stop-a" />
                    <stop offset="100%" className="res-stop-b" />
                  </linearGradient>
                </defs>
                {ticks.map((t) => (
                  <g key={t}>
                    <line
                      className="res-grid"
                      x1={ML}
                      x2={ML + PW}
                      y1={y(t)}
                      y2={y(t)}
                    />
                    <text
                      className="res-axis"
                      x={ML - 9}
                      y={y(t) + 3.5}
                      textAnchor="end"
                    >
                      {nf(t)}
                    </text>
                  </g>
                ))}
                <path className="res-area" d={area} />
                <path className="res-line" d={line} pathLength="1" />
                {active != null && (
                  <line
                    className="res-guide"
                    x1={x(active)}
                    x2={x(active)}
                    y1={MT}
                    y2={MT + PH}
                  />
                )}
                {items.map((it, i) => (
                  <g key={it.mes}>
                    <rect
                      className={
                        active === i ? 'res-band on' : 'res-band'
                      }
                      x={bandStart(i)}
                      y={MT}
                      width={bandEnd(i) - bandStart(i)}
                      height={PH}
                      tabIndex={0}
                      role="button"
                      aria-label={`${it.full}: ${nf(it.total)} resoluções`}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      onClick={() => setPinned((p) => (p === i ? null : i))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setPinned((p) => (p === i ? null : i));
                        }
                      }}
                    />
                    <text
                      className={`res-axis res-x${active === i ? ' on' : ''}${
                        i % 2 ? ' alt' : ''
                      }`}
                      x={x(i)}
                      y={H - 9}
                      textAnchor="middle"
                    >
                      {it.short}
                    </text>
                  </g>
                ))}
                {items.map((it, i) => (
                  <circle
                    key={it.mes}
                    className={`res-dot${active === i ? ' on' : ''}`}
                    cx={x(i)}
                    cy={y(it.total)}
                    r={active === i ? 5.5 : 3.6}
                  />
                ))}
              </svg>
              {active != null && (
                <div
                  className="res-tip"
                  style={{ left: `${tipLeft}%`, top: `${tipTop}%` }}
                  role="status"
                >
                  <span>{items[active].full}</span>
                  <b>{nf(items[active].total)}</b>
                  <small>
                    {items[active].total === 1 ? 'resolução' : 'resoluções'}
                  </small>
                </div>
              )}
              </div>
            </div>
            <div className="res-foot">
              <span className="res-hint">
                Passe o mouse ou toque em um mês para ver os detalhes.
              </span>
              {pinned != null && (
                <button
                  type="button"
                  className="res-clear"
                  onClick={() => setPinned(null)}
                >
                  Limpar seleção
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
