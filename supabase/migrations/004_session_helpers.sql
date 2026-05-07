CREATE OR REPLACE FUNCTION increment_session_correct(session_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.sessions
  SET
    total_correct = total_correct + 1,
    total_attempts = total_attempts + 1
  WHERE id = session_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_session_attempts(session_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.sessions
  SET total_attempts = total_attempts + 1
  WHERE id = session_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
