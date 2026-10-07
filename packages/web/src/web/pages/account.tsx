import { useState, type ReactNode } from "react";
import { Link, Redirect, useLocation } from "wouter";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  UserRound,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { authClient, captureSession, signOut } from "../lib/auth";
import { useProfile, useSaveProfile } from "../queries/customer";
import { PolicyDialog } from "../components/store-dialogs";

export function AccountFrame({ children }: { children: ReactNode }) {
  return (
    <div className="account-page">
      <header className="account-header">
        <Link href="/" className="wordmark">
          Fran
          <img className="brand-symbol" src="/images/symbol.png" alt="7" />
        </Link>
        <Link href="/" className="text-link">
          <ArrowLeft size={17} /> VOLTAR À LOJA
        </Link>
      </header>
      {children}
      <footer className="account-footer">
        © 2026 FRAN7 — BUILD YOUR LEGACY
      </footer>
    </div>
  );
}
function Password({
  name,
  label,
  confirm = false,
  login = false,
}: {
  name: string;
  label: string;
  confirm?: boolean;
  login?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <label>
      {label}
      <div className="password-field">
        <input
          aria-label={label}
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={login ? 1 : 8}
          maxLength={128}
          autoComplete={login ? "current-password" : "new-password"}
          placeholder={
            confirm ? "Repete a palavra-passe" : "A tua palavra-passe"
          }
        />
        <button
          type="button"
          className="icon-btn"
          aria-label={show ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </label>
  );
}
export default function Account() {
  const { data: session, isPending } = authClient.useSession();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState(
      new URLSearchParams(location.search).get("modo") === "registo"
        ? "register"
        : "login",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [policy, setPolicy] = useState("");
  if (isPending)
    return (
      <AccountFrame>
        <div className="account-box">A verificar sessão...</div>
      </AccountFrame>
    );
  if (session) return <Redirect to="/perfil" />;
  return (
    <AccountFrame>
      <section className="account-box">
        <span className="eyebrow">O TEU ESTILO. O TEU LEGADO.</span>
        <h1>
          BEM-VINDO(A)
          <br />À FRAN7
        </h1>
        <p>
          Entra na tua conta ou cria uma nova conta
          <br />
          para fazeres parte do movimento.
        </p>
        <div className="account-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
            disabled={busy}
          >
            ENTRAR
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
            }}
            disabled={busy}
          >
            CADASTRAR
          </button>
        </div>
        <form
          key={mode}
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget),
              email = String(fd.get("email")),
              password = String(fd.get("password"));
            if (mode === "register" && password !== fd.get("confirm")) {
              setError("As palavras-passe não coincidem.");
              return;
            }
            setBusy(true);
            setError("");
            try {
              const result =
                mode === "register"
                  ? await authClient.signUp.email(
                      { email, password, name: String(fd.get("name")) },
                      { onSuccess: captureSession },
                    )
                  : await authClient.signIn.email(
                      { email, password },
                      { onSuccess: captureSession },
                    );
              if (result.error) {
                setError(
                  result.error.code === "INVALID_EMAIL_OR_PASSWORD"
                    ? "E-mail ou palavra-passe incorretos."
                    : result.error.code === "USER_ALREADY_EXISTS"
                      ? "Já existe uma conta com este e-mail. Usa a opção Entrar."
                      : result.error.message || "Não foi possível continuar.",
                );
                return;
              }
              await authClient.getSession();
              navigate("/perfil");
            } catch {
              setError("Não foi possível ligar ao servidor. Tenta novamente.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {mode === "register" && (
            <label>
              Nome
              <input
                aria-label="Nome"
                name="name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="O teu nome"
              />
            </label>
          )}
          <label>
            E-mail
            <input
              aria-label="E-mail"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="O teu e-mail"
            />
          </label>
          <Password
            name="password"
            label="Palavra-passe"
            login={mode === "login"}
          />
          {mode === "register" && (
            <>
              <Password
                name="confirm"
                label="Confirmar palavra-passe"
                confirm
              />
              <small className="password-hint">
                Usa pelo menos 8 caracteres. Nunca guardamos a tua palavra-passe
                em texto simples.
              </small>
              <label className="consent">
                <input
                  aria-label="Aceitar termos e privacidade"
                  type="checkbox"
                  required
                />
                <span>
                  Li e aceito os{" "}
                  <button type="button" onClick={() => setPolicy("Termos")}>
                    Termos
                  </button>{" "}
                  e o{" "}
                  <button
                    type="button"
                    onClick={() => setPolicy("Privacidade")}
                  >
                    Aviso de Privacidade
                  </button>
                  .
                </span>
              </label>
            </>
          )}
          <button className="btn dark account-submit" disabled={busy}>
            {busy
              ? "A processar..."
              : mode === "register"
                ? "CRIAR CONTA"
                : "ENTRAR"}
          </button>
        </form>
        <div className="account-divider">OU</div>
        <button
          className="btn outline google-button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const result = await authClient.managedAuth.signIn({
                provider: "google",
              });
              if (result.error && result.error.code !== "POPUP_CLOSED")
                setError(
                  result.error.message || "Não foi possível entrar com Google.",
                );
              else if (!result.error) navigate("/perfil");
            } catch {
              setError("Não foi possível entrar com Google.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <SiGoogle /> Continuar com Google
        </button>
        {error && (
          <p className="account-error" role="alert">
            {error}
          </p>
        )}
        <div className="account-security">
          <ShieldCheck size={15} /> Os teus dados de acesso são protegidos.
        </div>
      </section>
      {policy && <PolicyDialog name={policy} onClose={() => setPolicy("")} />}
    </AccountFrame>
  );
}
export function Profile() {
  const { data: session, isPending } = authClient.useSession();
  const profile = useProfile(Boolean(session));
  if (isPending)
    return (
      <AccountFrame>
        <div className="account-box">A verificar sessão...</div>
      </AccountFrame>
    );
  if (!session) return <Redirect to="/conta" />;
  return (
    <AccountFrame>
      <section className="account-box profile-box">
        <div className="profile-avatar">
          <UserRound size={36} />
        </div>
        <h1>O TEU PERFIL</h1>
        <p>Bem-vindo(a), {session.user.name}.</p>
        {profile.isLoading ? (
          <p>A carregar os teus dados...</p>
        ) : profile.isError ? (
          <p role="alert">
            Não foi possível carregar o perfil.{" "}
            <button onClick={() => profile.refetch()}>Tentar novamente</button>
          </p>
        ) : (
          profile.data && <ProfileForm data={profile.data} />
        )}
        <button className="btn outline signout" onClick={() => signOut()}>
          <LogOut size={17} /> SAIR DA CONTA
        </button>
      </section>
    </AccountFrame>
  );
}
function ProfileForm({
  data,
}: {
  data: {
    name: string;
    email: string;
    emailVerified: boolean;
    phone: string;
    birthday: string;
    marketing: boolean;
  };
}) {
  const save = useSaveProfile();
  const [name, setName] = useState(data.name),
    [phone, setPhone] = useState(data.phone),
    [birthday, setBirthday] = useState(data.birthday),
    [marketing, setMarketing] = useState(data.marketing),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [ok, setOk] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setOk(false);
        try {
          await save.mutateAsync({ phone, birthday, marketing });
          const result = await authClient.updateUser({ name });
          if (result.error) throw new Error(result.error.message);
          setOk(true);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Não foi possível guardar.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Nome
        <input
          aria-label="Nome"
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        E-mail
        <input aria-label="E-mail" readOnly value={data.email} />
      </label>
      <small className="profile-email-note">
        {data.emailVerified
          ? "E-mail verificado"
          : "Conta criada com e-mail e palavra-passe. Este e-mail ainda não foi verificado."}
      </small>
      <label>
        Telefone (opcional)
        <input
          aria-label="Telefone"
          type="tel"
          maxLength={25}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+244 ..."
          autoComplete="tel"
        />
      </label>
      <label>
        Aniversário (opcional, DD/MM)
        <input
          aria-label="Aniversário"
          maxLength={5}
          placeholder="DD/MM"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
      </label>
      <label className="consent">
        <input
          aria-label="Receber novidades"
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        <span>
          Quero receber novidades e lançamentos da FRAN7. Posso retirar esta
          preferência a qualquer momento.
        </span>
      </label>
      <small className="password-hint">
        Esta preferência fica guardada; não ativa envios automáticos.
      </small>
      <button className="btn dark account-submit" disabled={busy}>
        {busy ? "A guardar..." : "GUARDAR PERFIL"}
      </button>
      {ok && <output>Perfil atualizado.</output>}
      {error && (
        <p role="alert" className="account-error">
          {error}
        </p>
      )}
    </form>
  );
}
