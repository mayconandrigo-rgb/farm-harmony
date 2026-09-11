insert into public.user_roles (user_id, role)
values ('366d9bd7-4351-4ae2-8341-e4aefcc6e8f7', 'gestor')
on conflict (user_id, role) do nothing;

delete from public.user_roles
where user_id = '366d9bd7-4351-4ae2-8341-e4aefcc6e8f7' and role = 'consulta';