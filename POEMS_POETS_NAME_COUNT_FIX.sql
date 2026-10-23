-- القافية: تفعيل اسم الشاعر والعد التلقائي، لا تحذف البيانات.
BEGIN;
ALTER TABLE public.poets ADD COLUMN IF NOT EXISTS display_name_mode text NOT NULL DEFAULT 'name';
ALTER TABLE public.poets ADD COLUMN IF NOT EXISTS poem_count integer NOT NULL DEFAULT 0;
CREATE OR REPLACE FUNCTION public.qafiyah_recount_poet_poems(p_poet_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF p_poet_id IS NOT NULL THEN
  UPDATE public.poets SET poem_count=(SELECT count(*)::integer FROM public.poems WHERE poet_id::text=p_poet_id) WHERE id::text=p_poet_id;
 END IF;
END;$$;
CREATE OR REPLACE FUNCTION public.qafiyah_sync_poet_poem_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' THEN PERFORM public.qafiyah_recount_poet_poems(NEW.poet_id::text);
 ELSIF TG_OP='DELETE' THEN PERFORM public.qafiyah_recount_poet_poems(OLD.poet_id::text);
 ELSIF NEW.poet_id IS DISTINCT FROM OLD.poet_id THEN
  PERFORM public.qafiyah_recount_poet_poems(OLD.poet_id::text);
  PERFORM public.qafiyah_recount_poet_poems(NEW.poet_id::text);
 END IF;
 RETURN NULL;
END;$$;
DROP TRIGGER IF EXISTS qafiyah_poem_count_sync ON public.poems;
CREATE TRIGGER qafiyah_poem_count_sync AFTER INSERT OR DELETE OR UPDATE OF poet_id ON public.poems
FOR EACH ROW EXECUTE FUNCTION public.qafiyah_sync_poet_poem_count();
UPDATE public.poets p SET poem_count=(SELECT count(*)::integer FROM public.poems m WHERE m.poet_id::text=p.id::text);
COMMIT;
