
CREATE TYPE public.app_role AS ENUM ('citizen', 'admin', 'officer');
CREATE TYPE public.grievance_status AS ENUM ('submitted', 'under_review', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.grievance_category AS ENUM ('water', 'electricity', 'roads', 'sanitation', 'public_safety', 'education', 'healthcare', 'other');
CREATE TYPE public.grievance_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.grievances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category grievance_category NOT NULL DEFAULT 'other',
  status grievance_status NOT NULL DEFAULT 'submitted',
  priority grievance_priority NOT NULL DEFAULT 'medium',
  location TEXT,
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_officer_id UUID REFERENCES auth.users(id),
  department TEXT,
  satisfaction INTEGER CHECK (satisfaction BETWEEN 1 AND 5),
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citizens can view own grievances" ON public.grievances FOR SELECT TO authenticated USING (
  auth.uid() = citizen_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer')
);
CREATE POLICY "Citizens can create grievances" ON public.grievances FOR INSERT TO authenticated WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Users can update grievances" ON public.grievances FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer') OR auth.uid() = citizen_id
);

CREATE TABLE public.grievance_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  status grievance_status NOT NULL,
  message TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grievance_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Timeline visible to related users" ON public.grievance_timeline FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.grievances g WHERE g.id = grievance_id AND (g.citizen_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer')))
);
CREATE POLICY "Auth users can add timeline" ON public.grievance_timeline FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.generate_ticket_id() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE seq_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num FROM public.grievances;
  NEW.ticket_id := 'NGP-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ticket_id BEFORE INSERT ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_id();
