import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, fmt } from '../api.js';
import { useLookups } from '../hooks.js';
import { X } from './icons.jsx';
const initials = (n) =>
  (n || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
export default function TicketModal({ id, edit, onClose }) {
  const qc = useQueryClient(),
    { data: L = {} } = useLookups();
  const { data: t } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api('/tickets/' + id),
  });
  const [f, setF] = useState({}),
    [err, setErr] = useState('');
  useEffect(() => {
    if (t)
      setF({
        titulo: t.titulo,
        descricao: t.descricao,
        statusId: t.statusId,
        prioridadeId: t.prioridadeId,
        responsavelId: t.responsavelId || '',
        comentario: '',
      });
  }, [t]);
  const save = useMutation({
    mutationFn: () =>
      api('/tickets/' + id, {
        method: 'PUT',
        body: {
          titulo: f.titulo,
          descricao: f.descricao,
          statusId: +f.statusId,
          prioridadeId: +f.prioridadeId,
          responsavelId: f.responsavelId ? +f.responsavelId : null,
          ...(f.comentario ? { comentario: f.comentario } : {}),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket', id] });
      onClose();
    },
    onError: (e) => setErr(e.message),
  });
  if (!t || f.titulo === undefined) return null;
  const d = !edit,
    set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const opts = (k) =>
    (L[k] || []).map((x) => (
      <option key={x.id} value={x.id}>
        {x.nome}
      </option>
    ));
  return (
    <div id="modal">
      <div className="box">
        <h3>
          Ticket #{id}
          <button
            className="btn sec sm icon-btn"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={14} />
          </button>
        </h3>
        <div className="body form">
          <div className="row">
            <label>Título</label>
            <input value={f.titulo} disabled={d} onChange={set('titulo')} />
          </div>
          <div className="row">
            <label>Descrição</label>
            <textarea
              rows={3}
              value={f.descricao}
              disabled={d}
              onChange={set('descricao')}
            />
          </div>
          <div className="row">
            <label>Status</label>
            <select value={f.statusId} disabled={d} onChange={set('statusId')}>
              {opts('status')}
            </select>
          </div>
          <div className="row">
            <label>Prioridade</label>
            <select
              value={f.prioridadeId}
              disabled={d}
              onChange={set('prioridadeId')}
            >
              {opts('prioridades')}
            </select>
          </div>
          <div className="row">
            <label>Responsável</label>
            <select
              value={f.responsavelId}
              disabled={d}
              onChange={set('responsavelId')}
            >
              <option value="" />
              {opts('usuarios')}
            </select>
          </div>
          <div className="row">
            <label>Mensagens</label>
            <div className="msgs">
              {t.mensagens.length
                ? t.mensagens.map((m, i) => (
                    <div className="msg" key={i}>
                      <span className="msg-ava">{initials(m.nome)}</span>
                      <div>
                        <div className="msg-head">
                          <b>{m.nome}</b>
                          <time>{fmt(m.criadoEm)}</time>
                        </div>
                        <div className="msg-text">{m.texto}</div>
                      </div>
                    </div>
                  ))
                : '—'}
            </div>
          </div>
          {edit && (
            <>
              <div className="row">
                <label>Comentário</label>
                <textarea
                  rows={2}
                  value={f.comentario}
                  onChange={set('comentario')}
                />
              </div>
              <div className="row">
                <span />
                <div>
                  <button
                    className="btn"
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                  >
                    Salvar
                  </button>
                  <div className="err">{err}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
