import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api, fmt, qs } from '../api.js';
import { useAuth } from '../auth.jsx';
import Filters from '../components/Filters.jsx';
import TicketModal from '../components/TicketModal.jsx';
import {
  Download,
  Refresh,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Plus,
} from '../components/icons.jsx';
export default function Tickets({ scope }) {
  const nav = useNavigate(),
    qc = useQueryClient(),
    { user } = useAuth(),
    isStaff = user?.perfil === 'analista' || user?.perfil === 'admin';
  const [draft, setDraft] = useState({}),
    [applied, setApplied] = useState({}),
    [page, setPage] = useState(1);
  const [open, setOpen] = useState(scope !== 'meus'),
    [modal, setModal] = useState(null),
    [wid, setWid] = useState(''),
    [busy, setBusy] = useState(false),
    [fb, setFb] = useState(null);
  useEffect(() => {
    setDraft({});
    setApplied({});
    setPage(1);
    setOpen(scope !== 'meus');
    setWid('');
    setFb(null);
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
  const work = async (ev) => {
    ev.preventDefault();
    const raw = String(wid).trim();
    if (!/^\d+$/.test(raw) || Number(raw) < 1) {
      setFb({
        ok: false,
        text: 'Informe um ID de ticket válido (número inteiro maior que zero).',
      });
      return;
    }
    const id = Number(raw);
    setBusy(true);
    setFb(null);
    try {
      const t = await api(`/tickets/${id}/trabalhar`, { method: 'POST' });
      setFb({
        ok: true,
        text: `Ticket #${t.id} — ${t.titulo} atribuído a você.`,
      });
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket', id] });
      setModal({ id, edit: true });
    } catch (e) {
      setFb({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="head">
        <button className="btn icon-btn" onClick={() => nav('/novo')}>
          <Plus size={14} /> Novo Ticket
        </button>
      </div>
      {scope === 'meus' && isStaff && (
        <div className="box">
          <h3>Buscar Meus Tickets</h3>
          <form
            className="body"
            style={{ display: 'flex', gap: 20, alignItems: 'end' }}
            onSubmit={work}
          >
            <div>
              <label>Tipo de trabalho :</label>
              <select>
                <option>Ticket</option>
              </select>
            </div>
            <div>
              <label htmlFor="wid">ID do ticket :</label>
              <input
                id="wid"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="ex.: 7"
                value={wid}
                onChange={(e) => setWid(e.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={busy || !wid}>
              {busy ? 'Buscando…' : 'buscar'}
            </button>
          </form>
          {fb && (
            <div
              className={fb.ok ? 'auth-ok' : 'err'}
              style={{ padding: '0 16px 12px' }}
              role={fb.ok ? 'status' : 'alert'}
              aria-live="polite"
            >
              {fb.text}
            </div>
          )}
        </div>
      )}
      <div className="box">
        <h3>
          Filtros{' '}
          <button
            type="button"
            className="filter-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Recolher filtros' : 'Expandir filtros'}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
            </svg>
          </button>
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
            <button className="btn sec sm icon-btn" onClick={exportCsv}>
              <Download size={13} /> Exportar
            </button>{' '}
            <button className="btn sec sm icon-btn" onClick={() => refetch()}>
              <Refresh size={13} /> Atualizar
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
                  <td className="strong">{t.id}</td>
                  <td>
                    <span className="badge" style={{ '--c': t.cor }}>
                      {t.prioridade.split(' - ')[0]}
                    </span>
                  </td>
                  <td className="strong">{t.titulo}</td>
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
                  <td colSpan={13}>
                    <div className="empty">
                      <Inbox size={28} />
                      Nenhum ticket encontrado.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pg">
          <button
            className="pg-btn"
            aria-label="Página anterior"
            disabled={page < 2}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          <span>
            {page}/{pages}
          </span>
          <button
            className="pg-btn"
            aria-label="Próxima página"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      {modal && <TicketModal {...modal} onClose={() => setModal(null)} />}
    </>
  );
}
