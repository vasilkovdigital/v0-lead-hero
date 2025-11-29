-- =============================================================================
-- Миграция: Добавление роли admin для неограниченного создания форм
-- Описание: Позволяет админам создавать/удалять неограниченное количество форм
-- Проверено на реальном состоянии БД 29.11.2024
-- =============================================================================

-- 1. Добавляем роль 'admin' в constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('superadmin', 'admin', 'user'));

-- 2. Обновляем указанного пользователя до admin
UPDATE public.users 
SET role = 'admin' 
WHERE id = '6cb16c09-6a85-4079-9579-118168e95b06';

-- 3. Обновляем функцию is_superadmin чтобы включала admin
-- (теперь это по сути is_admin_or_superadmin, но имя оставляем для совместимости)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Обновляем политику UPDATE (правильное имя из БД: forms_owner_update)
DROP POLICY IF EXISTS "forms_owner_update" ON public.forms;
CREATE POLICY "forms_owner_update"
  ON public.forms FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (owner_id = auth.uid() OR public.is_superadmin());

-- 5. Обновляем политику DELETE (правильное имя из БД: forms_owner_delete)
DROP POLICY IF EXISTS "forms_owner_delete" ON public.forms;
CREATE POLICY "forms_owner_delete"
  ON public.forms FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

-- 6. Обновляем функцию handle_new_user (без изменений логики)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email = 'hello@vasilkov.digital' THEN 'superadmin'
      ELSE 'user' 
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
