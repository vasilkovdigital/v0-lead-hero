-- =============================================================================
-- Миграция: Добавление политики для суперадминов читать все лиды
-- Описание: Позволяет суперадминам видеть все лиды в таблице leads
-- Дата: 03.12.2025
-- =============================================================================

-- Удаляем политику, если она уже существует
DROP POLICY IF EXISTS "leads_read_all_for_superadmin" ON public.leads;

-- Добавляем политику для суперадминов: разрешить чтение всех лидов
CREATE POLICY "leads_read_all_for_superadmin"
ON public.leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- Также добавляем политику для удаления лидов для superadmin
DROP POLICY IF EXISTS "leads_delete_for_superadmin" ON public.leads;

CREATE POLICY "leads_delete_for_superadmin"
ON public.leads
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  )
);

