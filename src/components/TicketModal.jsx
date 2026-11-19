import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, fmt } from '../api.js';
import { useAuth } from '../auth.jsx';
import { isStaff } from '../permissions.js';
import { useLookups } from '../hooks.js';
import { Trash, X } from './icons.jsx';

const Field = ({ label, wide, children }) => (
  <div className={wide ? 'tk-f wide' : 'tk-f'}>
    <span className="tk-lbl">{label}</span>
    <div className="tk-val">{children}</div>
  </div>
);
const or = (v) => v || '—';

export default function TicketModal({ id, edit, onClose }) {
  const qc = useQueryClient(),
    { user } = useAuth(),
    staff = isStaff(user),
    canEdit = edit && staff,
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
    mutationFn: () => {
      // Quem não é da equipe só pode comentar; enviar os campos faria o
      // backend recusar a requisição inteira com 403.
      if (!staff) {
        const comentario = (f.comentario || '').trim();
        if (!comentario) throw new Error('Escreva um comentário.');
        return api('/tickets/' + id, {
          method: 'PUT',
          body: { comentario },
        });
      }
      return api('/tickets/' + id, {
        method: 'PUT',
        body: {
          titulo: f.titulo,
          descricao: f.descricao,
          statusId: +f.statusId,
          prioridadeId: +f.prioridadeId,
          responsavelId: f.responsavelId ? +f.responsavelId : null,
          ...(f.comentario ? { comentario: f.comentario } : {}),
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket', id] });
      onClose();
    },
    onError: (e) => setErr(e.message),
  });
  const del = useMutation({
    mutationFn: () => api('/tickets/' + id, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.removeQueries({ queryKey: ['ticket', id] });
      onClose();
    },
    onError: (e) => setErr(e.message),
  });
  const confirmDelete = () => {
    if (
      window.confirm(
        `Excluir o ticket #${id}? Esta ação não pode ser desfeita.`,
      )
    )
      del.mutate();
  };
  if (!t || f.titulo === undefined) return null;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const opts = (k) =>
    (L[k] || []).map((x) => (
      <option key={x.id} value={x.id}>
        {x.nome}
      </option>
    ));
  const msgs = t.mensagens || [];
  return (
    <div
      id="modal"
      role="dialog"
      aria-modal="true"
      aria-label={!edit ? 'Visualizar ticket' : staff ? 'Editar ticket' : 'Comentar ticket'}
      onClick={(e) => e.target.id === 'modal' && onClose()}
    >
      <div className="tk-page">
        <div className="tk-head">
          <div>
            <h1>{!edit ? 'Visualizar Ticket' : staff ? 'Editar Ticket' : 'Comentar Ticket'}</h1>
            <div className="tk-crumb">
              Tickets <span>›</span> #{id}
            </div>
          </div>
          <button
            type="button"
            className="btn sec sm icon-btn"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={15} />
          </button>
        </div>

        <section className="tk-card">
          <h2>Detalhes do Ticket</h2>
          <div className="tk-body">
            <div className="tk-grid">
              <Field label="Título" wide>
                {canEdit ? (
                  <input value={f.titulo} onChange={set('titulo')} />
                ) : (
                  <span className="tk-strong">{t.titulo}</span>
                )}
              </Field>

              <Field label="Descrição" wide>
                {canEdit ? (
                  <textarea
                    rows={3}
                    value={f.descricao}
                    onChange={set('descricao')}
                  />
                ) : (
                  <div className="tk-pre">{or(t.descricao)}</div>
                )}
              </Field>

              <Field label="Criado em">{or(fmt(t.criadoEm))}</Field>
              <Field label="Alterado em">{or(fmt(t.alteradoEm))}</Field>

              <Field label="Responsável">
                {canEdit ? (
                  <select value={f.responsavelId} onChange={set('responsavelId')}>
                    <option value="" />
                    {opts('usuarios')}
                  </select>
                ) : (
                  or(t.responsavel)
                )}
              </Field>
              <Field label="Previsão para solução">
                {or(fmt(t.previsaoSolucao))}
              </Field>

              <Field label="Categoria">{or(t.categoria)}</Field>
              <Field label="Empresa">{or(t.empresa)}</Field>

              <Field label="Prioridade">
                {canEdit ? (
                  <select value={f.prioridadeId} onChange={set('prioridadeId')}>
                    {opts('prioridades')}
                  </select>
                ) : (
                  <span className="badge" style={{ '--c': t.cor }}>
                    {(t.prioridade || '').split(' - ')[0] || '—'}
                  </span>
                )}
              </Field>
              <Field label="Solicitante">{or(t.solicitante)}</Field>

              <Field label="Status">
                {canEdit ? (
                  <select value={f.statusId} onChange={set('statusId')}>
                    {opts('status')}
                  </select>
                ) : (
                  or(t.status)
                )}
              </Field>
              <Field label="Área">{or(t.area)}</Field>

              <Field label="Sistema">{or(t.sistema)}</Field>
              <Field label="Classificação">{or(t.classificacao)}</Field>

              <Field label="Resolvido em">{or(fmt(t.resolvidoEm))}</Field>
              <Field label="Tickets relacionados" wide>
                <div className="tk-pre">{or(t.relacionados)}</div>
              </Field>
            </div>
          </div>
        </section>

        <section className="tk-card">
          <h2>Mensagens</h2>
          <div className="tk-body">
            {msgs.length ? (
              <div className="tk-msgs">
                {msgs.map((m, i) => (
                  <article className="tk-msg" key={i}>
                    <header className="tk-msg-head">
                      <b>{m.nome}</b>
                      <time>{fmt(m.criadoEm)}</time>
                    </header>
                    <div className="tk-msg-text">{m.texto}</div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="tk-empty">Nenhuma mensagem registrada.</div>
            )}
            {edit && (
              <div className="tk-comment">
                <label htmlFor="tk-comentario">Novo comentário</label>
                <textarea
                  id="tk-comentario"
                  rows={3}
                  value={f.comentario}
                  onChange={set('comentario')}
                  placeholder="Adicione um comentário ao ticket…"
                />
              </div>
            )}
          </div>
        </section>

        {edit && (
          <>
            <div className="tk-footer">
              <div>
                {staff && (
                  <button
                    type="button"
                    className="btn danger sm"
                    onClick={confirmDelete}
                    disabled={del.isPending}
                  >
                    <Trash size={13} /> Excluir
                  </button>
                )}
              </div>
              <div className="tk-actions">
                <button type="button" className="btn sec" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => save.mutate()}
                  disabled={save.isPending || (!staff && !f.comentario?.trim())}
                >
                  {save.isPending
                    ? staff
                      ? 'Salvando…'
                      : 'Enviando…'
                    : staff
                      ? 'Salvar'
                      : 'Enviar comentário'}
                </button>
              </div>
            </div>
            {err && (
              <div className="tk-error" role="alert">
                {err}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
