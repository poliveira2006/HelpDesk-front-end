import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api, fmt, qs } from '../api.js';
import Filters from '../components/Filters.jsx';
import TicketModal from '../components/TicketModal.jsx';
const TITLE = {
  meus: 'Meus Tickets',
  ativos: 'Tickets Ativos',
  todos: 'Todos os Tickets',
};
export default function Tickets({ scope }) {
  const nav = useNavigate(),
    qc = useQueryClient();
  const [draft, setDraft] = useState({}),
    [applied, setApplied] = useState({}),
    [page, setPage] = useState(1);
  const [open, setOpen] = useState(scope !== 'meus'),
    [modal, setModal] = useState(null),
    [wid, setWid] = useState('');
  useEffect(() => {
    setDraft({});
    setApplied({});
    setPage(1);
    setOpen(scope !== 'meus');
  }, [scope]);
  const params = {
    ...applied,
    semPrevisao: applied.semPrevisao ? '1' : '',
    scope,
    page,
  };
  const { data, refetch } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => api('/tickets?' + qs(params)),
    placeholderData: keepPreviousData,
  });
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const exportCsv = async () => {
    const b = await api('/tickets/export?' + qs({ ...params, page: '' }), {
      blob: true,
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'tickets.csv';
    a.click();
  };
  const work = async () => {
    try {
      await api(`/tickets/${parseInt(wid, 10)}/trabalhar`, { method: 'POST' });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    } catch (e) {
      alert(e.message);
    }
  };
  return (
    <>
      <div className="head">
        <h1>{TITLE[scope]}</h1>
        <button className="btn" onClick={() => nav('/novo')}>
          Novo Ticket
        </button>
      </div>
      {scope === 'meus' && (
        <div className="box">
          <h3>Trabalhar</h3>
          <div
            className="body"
            style={{ display: 'flex', gap: 20, alignItems: 'end' }}
          >
            <div>
              <label>Tipo de trabalho :</label>
              <select>
                <option>Ticket</option>
              </select>
            </div>
            <div>
              <label>Id do trabalho :</label>
              <input
                type="number"
                value={wid}
                onChange={(e) => setWid(e.target.value)}
              />
            </div>
            <button className="btn" onClick={work}>
              Começar
            </button>
          </div>
        </div>
      )}
      <div className="box">
        <h3>
          Filtros{' '}
          <span style={{ cursor: 'pointer' }} onClick={() => setOpen(!open)}>
            {open ? '⌃' : '⌄'}
          </span>
        </h3>
        {open && (
          <Filters
            v={draft}
            set={setDraft}
            onApply={() => {
              setApplied(draft);
              setPage(1);
            }}
          />
        )}
      </div>
      <div className="box">
        <h3>
          <span>Lista de Tickets ({data?.total ?? 0})</span>
          <span>
            <button className="btn sec sm" onClick={exportCsv}>
              ⭳ Exportar
            </button>{' '}
            <button className="btn sec sm" onClick={() => refetch()}>
              ⟳ Atualizar
            </button>
          </span>
        </h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Prioridade</th>
                <th>Título</th>
                <th>Criado</th>
                <th>Sistema</th>
                <th>Status</th>
                <th>Categoria</th>
                <th>Empresa</th>
                <th>Responsável</th>
                <th>Previsão</th>
                <th>Solução</th>
                <th>Classificação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>
                    <span className="badge" style={{ background: t.cor }}>
                      {t.prioridade.split(' - ')[0]}
                    </span>
                  </td>
                  <td>{t.titulo}</td>
                  <td>{fmt(t.criadoEm)}</td>
                  <td>{t.sistema}</td>
                  <td>{t.status}</td>
                  <td>{t.categoria}</td>
                  <td>{t.empresa}</td>
                  <td>{t.responsavel}</td>
                  <td>{fmt(t.previsaoSolucao)}</td>
                  <td>{fmt(t.resolvidoEm)}</td>
                  <td>{t.classificacao}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="btn sec sm"
                      onClick={() => setModal({ id: t.id, edit: false })}
                    >
                      Visualizar
                    </button>{' '}
                    <button
                      className="btn sm"
                      onClick={() => setModal({ id: t.id, edit: true })}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {data && !data.items.length && (
                <tr>
                  <td colSpan={13}>Nenhum ticket.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pg">
          <button
            className="btn sec sm"
            disabled={page < 2}
            onClick={() => setPage(page - 1)}
          >
            ‹
          </button>{' '}
          {page}/{pages}
          <button
            className="btn sec sm"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            ›
          </button>
        </div>
      </div>
      {modal && <TicketModal {...modal} onClose={() => setModal(null)} />}
    </>
  );
}
