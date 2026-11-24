DROP POLICY IF EXISTS "Ler permissões" ON public.permissoes_modulo;

CREATE POLICY "Ler permissões dos próprios perfis"
ON public.permissoes_modulo
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = permissoes_modulo.role
  )
);