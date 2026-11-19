// Perfis com permissão de equipe (veem todos os tickets e podem editar/excluir).
export const isStaff = (user) =>
  !!user && (user.perfil === 'analista' || user.perfil === 'admin');
