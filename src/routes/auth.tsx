import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Factory, Loader2 } from "lucide-react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — ForjaERP" },
      { name: "description", content: "Acesso ao ForjaERP: gestão integrada de produção, estoque, compras, vendas e transporte." },
      { property: "og:title", content: "Entrar — ForjaERP" },
      { property: "og:description", content: "Acesse o ERP industrial ForjaERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function GoogleG() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
  );
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const destino = redirect ?? "/";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: destino, replace: true });
    });
  }, [destino, navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || senha.length < 8) {
      toast.error("Informe um e-mail válido e uma senha com pelo menos 8 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: destino, replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password: senha,
          options: { emailRedirectTo: window.location.origin, data: { nome: nome.trim() } },
        });
        if (error) throw error;
        toast.success("Cadastro feito. Confirme pelo link enviado ao seu e-mail.");
        setModo("entrar");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos." : msg);
    } finally {
      setEnviando(false);
    }
  }

  async function social(p: "google" | "lovable") {
    if (redirect) sessionStorage.setItem("forja-pos-login", redirect);
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) toast.error("Não foi possível entrar. Tente novamente.");
    else if (!r.redirected) navigate({ to: destino, replace: true });
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-border bg-sidebar p-10 lg:flex">
        <p className="font-display text-2xl uppercase tracking-tight">Forja<span className="text-primary">ERP</span></p>
        <div>
          <Factory className="mb-6 size-12 text-primary" />
          <h1 className="font-display text-4xl uppercase leading-tight">Produção, estoque e expedição em um só sistema.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">MRP, chão de fábrica, armazém, transporte, compras, vendas e qualidade integrados.</p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Acesso restrito a usuários autorizados</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="font-display text-2xl uppercase">{modo === "entrar" ? "Entrar" : "Criar conta"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modo === "entrar" ? "Use seu e-mail corporativo." : "Um administrador define seu perfil de acesso depois do cadastro."}
            </p>
          </div>
          <div className="space-y-2">
            <Button type="button" variant="outline" className="w-full" onClick={() => social("google")}><GoogleG />Continuar com Google</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => social("lovable")}><LovableMark />Continuar com Lovable</Button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={enviar} className="space-y-3">
            {modo === "cadastrar" && (
              <div className="space-y-1"><Label htmlFor="nome">Nome</Label><Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
            )}
            <div className="space-y-1"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-1"><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} /></div>
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando && <Loader2 className="animate-spin" />}{modo === "entrar" ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
          <button type="button" className="text-sm text-primary" onClick={() => setModo(modo === "entrar" ? "cadastrar" : "entrar")}>
            {modo === "entrar" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
