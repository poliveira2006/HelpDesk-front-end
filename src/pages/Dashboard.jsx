import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, fmt } from '../api.js';

const P = [
  ['1', '1 dia'],
  ['7', '7 dias'],
  ['30', '1 mês'],
  ['90', '3 meses'],
  ['365', '1 ano'],
];
const PLBL = Object.fromEntries(P);
const n = (v) => (v == null ? '—' : Number(v).toLocaleString('pt-BR'));

const layers = (
  <>
    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
    <path d="m2 12 10 5 10-5" />
    <path d="m2 17 10 5 10-5" />
  </>
);
const check = (
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </>
);
const alert = (
  <>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
);
const Ic = ({ d }) => (
  <svg
    viewBox="0 0 24 24"
    width="30"
    height="30"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

export default function Dashboard() {
  const [dias, setDias] = useState('7');
  const { data, isLoading } = useQuery({
    queryKey: ['stats', dias],
    queryFn: () => api(`/tickets/stats?dias=${dias}`),
    placeholderData: keepPreviousData,
  });
  return (
    <div className="dash">
      <h1 className="dash-title">Tickets Criados no(s) último(s)</h1>
      <div className="chips">
        {P.map(([v, l]) => (
          <button
            key={v}
            className={v === dias ? 'chip on' : 'chip'}
            onClick={() => setDias(v)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="cards">
        <div className="card ok">
          <div>
            <span className="lbl">Tickets Ativos</span>
            <b>{isLoading && !data ? '—' : n(data?.ativos)}</b>
          </div>
          <span className="ic ok">
            <Ic d={layers} />
          </span>
        </div>
        <div className="card done">
          <div>
            <span className="lbl">Tickets Concluídos</span>
            <b>{isLoading && !data ? '—' : n(data?.concluidos)}</b>
          </div>
          <span className="ic done">
            <Ic d={check} />
          </span>
        </div>
        <div className="card late">
          <div>
            <span className="lbl">Tickets Atrasados</span>
            <b>{isLoading && !data ? '—' : n(data?.atrasados)}</b>
          </div>
          <span className="ic late">
            <Ic d={alert} />
          </span>
        </div>
      </div>

      <div className="box recent">
        <h3>Últimos Tickets Atualizados ({PLBL[dias]})</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Prioridade</th>
                <th>Título</th>
                <th>Criado</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentes?.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>
                    <span className="badge" style={{ background: t.cor }}>
                      {(t.prioridade || '').split(' - ')[0]}
                    </span>
                  </td>
                  <td>{t.titulo}</td>
                  <td>{fmt(t.criadoEm)}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
              {data && !data.recentes?.length && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', color: '#98a0a9' }}
                  >
                    Nenhum ticket atualizado no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
