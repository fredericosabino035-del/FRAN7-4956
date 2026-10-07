import { useState, useEffect } from "react";
import { ArrowLeft, LogOut, Save, Upload, Trash2 } from "lucide-react";
import { authClient,signOut } from "../lib/auth";
import {
  useAccess,
  useProducts,
  useUpdateProduct,
  useComments,
  useRemoveComment,
} from "../queries/store";
import { money, type Product } from "../lib/store";
export default function Management() {
  const { data: session, isPending } = authClient.useSession();
  const access = useAccess(Boolean(session));
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    authClient.managedAuth
      .handleRedirect()
      .catch(() => setError("Não foi possível concluir a entrada."));
  }, []);
  return (
    <div className="management">
      <header>
        <a href="/" className="text-link">
          <ArrowLeft size={18} /> VOLTAR À LOJA
        </a>
        <strong>FRAN7 / GESTÃO</strong>
        {session && (
          <button className="text-link" onClick={() => signOut()}>
            <LogOut size={18} /> Sair
          </button>
        )}
      </header>
      {isPending ? (
        <p>A verificar sessão...</p>
      ) : !session ? (
        <div className="login">
          <span className="eyebrow">ÁREA RESERVADA</span>
          <h1>
            O teu legado.
            <br />A tua loja.
          </h1>
          <p>
            Altera os preços, nomes, fotos, tamanhos e categorias dos produtos.
            Revê e modera os comentários.
          </p>
          <p>
            Entra com a conta Google <strong>fran7officiall@gmail.com</strong>.
          </p>
          <button
            className="btn dark"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const result = await authClient.managedAuth.signIn({
                  provider: "google",
                });
                if (result.error)
                  setError(result.error.message || "Não foi possível entrar.");
              } catch {
                setError("Não foi possível entrar. Tenta novamente.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "A entrar..." : "Entrar com Google"}{" "}
            <ArrowLeft style={{ transform: "rotate(180deg)" }} size={18} />
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      ) : access.isLoading ? (
        <p>A verificar permissões...</p>
      ) : access.isError ? (
        <div className="login">
          <h2>Acesso reservado.</h2>
          <p>{access.error.message}</p>
          <p>Usa a conta Google verificada da FRAN7.</p>
        </div>
      ) : (
        <Editor />
      )}
    </div>
  );
}
function Editor() {
  const products = useProducts();
  const [id, setId] = useState(1);
  const p = products.data?.find((p) => p.id === id);
  return (
    <>
      <div className="section-top">
        <div>
          <span className="eyebrow">CONTROLO DO CATÁLOGO</span>
          <h2>A tua coleção.</h2>
        </div>
        <p>As alterações guardadas ficam visíveis na loja.</p>
      </div>
      <div className="notice">
        Os preços iniciais são exemplos. Confirma os dados de cada peça e
        desmarca “Dados provisórios” antes de vender. As políticas de entrega e
        troca ainda precisam da tua validação.
      </div>
      {products.isLoading ? (
        <p>A carregar...</p>
      ) : products.isError ? (
        <p>Não foi possível carregar os produtos.</p>
      ) : (
        <div className="editor-layout">
          <aside>
            {products.data?.map((p) => (
              <button
                className={id === p.id ? "active" : ""}
                key={p.id}
                onClick={() => setId(p.id)}
              >
                <img src={p.image} alt="" />
                <span>
                  {p.name}
                  <small>{money(p.price)}</small>
                </span>
              </button>
            ))}
          </aside>
          {p && <ProductEditor key={p.id} p={p} />}
        </div>
      )}
    </>
  );
}
function ProductEditor({ p }: { p: Product }) {
  const [data, setData] = useState(p),
    [imageError, setImageError] = useState("");
  const update = useUpdateProduct();
  const comments = useComments(p.id),
    remove = useRemoveComment();
  function field(key: keyof Product, value: string | number | boolean) {
    setData((d) => ({ ...d, [key]: value }));
  }
  return (
    <div>
      <form
        className="edit-form"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate({
            ...data,
            category: data.category as
              "Unissexo" | "Mulheres" | "Homens" | "Crianças",
            kind: data.kind as "T-shirts" | "Bonés",
          });
        }}
      >
        <div className="edit-photo">
          <img src={data.image} alt={data.name} />
          <label className="btn outline">
            <Upload size={16} /> Alterar foto
            <input
              aria-label="Alterar foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2000000) {
                  setImageError("Escolhe uma imagem até 2 MB.");
                  return;
                }
                if (
                  !["image/jpeg", "image/png", "image/webp"].includes(file.type)
                ) {
                  setImageError("Formato não suportado.");
                  return;
                }
                setImageError("");
                const reader = new FileReader();
                reader.onload = () => field("image", String(reader.result));
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <small>JPG, PNG ou WebP · até 2 MB</small>
          {imageError && <p role="alert">{imageError}</p>}
        </div>
        <div className="edit-fields">
          <label>
            Nome
            <input
              required
              aria-label="Nome do produto"
              minLength={2}
              maxLength={100}
              value={data.name}
              onChange={(e) => field("name", e.target.value)}
            />
          </label>
          <label>
            Preço em Kz
            <input
              required
              aria-label="Preço em Kz"
              type="number"
              min={0}
              max={100000000}
              step={1}
              value={data.price}
              onChange={(e) => field("price", Number(e.target.value))}
            />
          </label>
          <label>
            Categoria
            <select
              value={data.category}
              onChange={(e) => field("category", e.target.value)}
            >
              {["Unissexo", "Mulheres", "Homens", "Crianças"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select
              value={data.kind}
              onChange={(e) => field("kind", e.target.value)}
            >
              <option>T-shirts</option>
              <option>Bonés</option>
            </select>
          </label>
          <label>
            Tamanhos (separados por vírgulas)
            <input
              required
              maxLength={100}
              aria-label="Tamanhos"
              value={data.sizes}
              onChange={(e) => field("sizes", e.target.value)}
            />
          </label>
          <label>
            Descrição
            <textarea
              required
              aria-label="Descrição"
              maxLength={2000}
              value={data.description}
              onChange={(e) => field("description", e.target.value)}
            />
          </label>
          <label>
            Lançamento (deixa vazio para disponibilizar a peça)
            <input
              aria-label="Lançamento"
              maxLength={60}
              placeholder="Ex.: Novembro"
              value={data.releaseLabel}
              onChange={(e) => field("releaseLabel", e.target.value)}
            />
          </label>
          <label className="checkbox">
            <input
              aria-label="Dados provisórios"
              type="checkbox"
              checked={data.provisional}
              onChange={(e) => field("provisional", e.target.checked)}
            />{" "}
            Dados provisórios
          </label>
          <button className="btn dark" disabled={update.isPending}>
            <Save size={17} />
            {update.isPending ? "A guardar..." : "Guardar alterações"}
          </button>
          {update.isSuccess && <output>Alterações guardadas na loja.</output>}
          {update.isError && <p role="alert">{update.error.message}</p>}
        </div>
      </form>
      <div className="comments">
        <h3>Comentários deste produto</h3>
        {comments.isLoading ? (
          <p>A carregar...</p>
        ) : comments.isError ? (
          <p>Não foi possível carregar os comentários.</p>
        ) : comments.data?.length ? (
          comments.data.map((c) => (
            <article key={c.id}>
              <strong>{c.name}</strong>
              <p>{c.body}</p>
              <button
                className="text-link"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm("Remover este comentário?"))
                    remove.mutate({ id: c.id });
                }}
              >
                <Trash2 size={15} /> Remover comentário
              </button>
            </article>
          ))
        ) : (
          <p>Sem comentários.</p>
        )}
        {remove.isError && <p>{remove.error.message}</p>}
      </div>
    </div>
  );
}
