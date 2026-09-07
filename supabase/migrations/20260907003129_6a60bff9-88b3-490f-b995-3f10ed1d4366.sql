create policy "documentos_select" on storage.objects for select to authenticated using (bucket_id = 'documentos');
create policy "documentos_insert" on storage.objects for insert to authenticated with check (bucket_id = 'documentos' and public.can_operate());
create policy "documentos_delete" on storage.objects for delete to authenticated using (bucket_id = 'documentos' and public.is_gestor());
