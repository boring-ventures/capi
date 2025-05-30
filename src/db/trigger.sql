-- Asegúrate de que la extensión esté habilitada
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Verificar si podemos hacer llamadas HTTP directamente
DO $$
BEGIN
  PERFORM extensions.http_post(
    'https://lizgjhypnuaaduaftafp.supabase.co/functions/v1/send-account-approved-email',
    '{"email":"test@example.com","full_name":"Test","review_status":"approved"}',
    'application/json',
    '{"apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpemdqaHlwbnVhYWR1YWZ0YWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMzU3NTcsImV4cCI6MjA0NTgxMTc1N30.fo1rbcV4XPpcWBB3GzCnxsBEmp-eQikt-sk3Zn7g6PI", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpemdqaHlwbnVhYWR1YWZ0YWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMzU3NTcsImV4cCI6MjA0NTgxMTc1N30.fo1rbcV4XPpcWBB3GzCnxsBEmp-eQikt-sk3Zn7g6PI"}'
  );
  RAISE NOTICE 'Llamada de prueba realizada';
END $$;

-- Crear o reemplazar la función del trigger con logs detallados
CREATE OR REPLACE FUNCTION notify_user_review_status() RETURNS trigger AS $$
DECLARE
  payload text;
  response text;
BEGIN
  -- Registrar cada vez que se ejecuta el trigger
  RAISE LOG 'Trigger ejecutado: antigua=%, nueva=%', OLD."reviewStatus", NEW."reviewStatus";
  
  -- Solo ejecutar cuando reviewStatus cambia y es approved o rejected
  IF (OLD."reviewStatus" IS DISTINCT FROM NEW."reviewStatus") AND 
     (NEW."reviewStatus" IN ('approved', 'rejected')) THEN
    
    -- Construir payload y registrarlo
    payload := jsonb_build_object(
      'email', NEW.email,
      'full_name', NEW.name,
      'review_status', NEW."reviewStatus",
      'timestamp', now()
    )::text;
    
    RAISE LOG 'Enviando payload: %', payload;
    
    -- Capturar la respuesta como texto
    BEGIN
      SELECT content INTO response FROM extensions.http_post(
        'https://lizgjhypnuaaduaftafp.supabase.co/functions/v1/send-account-approved-email',
        payload,
        'application/json',
    '{"apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpemdqaHlwbnVhYWR1YWZ0YWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMzU3NTcsImV4cCI6MjA0NTgxMTc1N30.fo1rbcV4XPpcWBB3GzCnxsBEmp-eQikt-sk3Zn7g6PI", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpemdqaHlwbnVhYWR1YWZ0YWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMzU3NTcsImV4cCI6MjA0NTgxMTc1N30.fo1rbcV4XPpcWBB3GzCnxsBEmp-eQikt-sk3Zn7g6PI"}'
      );
      RAISE LOG 'Respuesta recibida: %', response;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error al enviar HTTP: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger anterior si existía
DROP TRIGGER IF EXISTS trg_notify_review_status ON public.users;

-- Crear el nuevo trigger
CREATE TRIGGER trg_notify_review_status
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION notify_user_review_status();

-- Comprobar si el trigger se instaló correctamente
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'trg_notify_review_status';