-- =============================================================================
-- Миграция: Добавление политики для суперадминов читать всех пользователей
-- Описание: Позволяет суперадминам видеть всех пользователей в таблице users
-- Дата: 29.11.2024
-- =============================================================================

-- Удаляем политику, если она уже существует
DROP POLICY IF EXISTS "users_read_all_for_superadmin" ON public.users;

-- Добавляем политику для суперадминов: разрешить чтение всех пользователей
CREATE POLICY "users_read_all_for_superadmin"
ON public.users
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

