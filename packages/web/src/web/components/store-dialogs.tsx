import { useEffect, type ReactNode } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Star,
  Trash2,
} from "lucide-react";
import { useComment, useComments } from "../queries/store";
import { money, whatsapp, type Product, type CartItem } from "../lib/store";
export function Overlay({
  children,
  onClose,
  drawer = false,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
  label: string;
}) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const timer = requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".overlay button")?.focus(),
    );
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".overlay button,.overlay a,.overlay input,.overlay textarea,.overlay select",
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(timer);
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div className={"overlay " + (drawer ? "drawer-overlay" : "")}>
      <button
        className="overlay-backdrop"
        aria-label="Fechar janela"
        onClick={onClose}
      />
      <dialog
        open
        aria-modal="true"
        aria-label={label}
        className={drawer ? "drawer" : "modal"}
      >
        <button
          className="close icon-btn"
          aria-label="Fechar"
          onClick={onClose}
        >
          <X />
        </button>
        {children}
      </dialog>
    </div>
  );
}
export function ProductDialog({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (p: Product, size: string) => void;
}) {
  const comments = useComments(product.id),
    add = useComment();
  return (
    <Overlay label={product.name} onClose={onClose}>
      <div className="product-detail">
        <img src={product.image} alt={product.name} />
        <div className="detail-copy">
          <span className="eyebrow">FRAN7 COLLECTION / {product.category}</span>
          {product.releaseLabel && (
            <span className="release-notice">
              <Star size={15} fill="currentColor" /> BREVEMENTE —{" "}
              {product.releaseLabel.toUpperCase()}
            </span>
          )}
          <h2>{product.name}</h2>
          <p className="detail-price">{money(product.price)}</p>
          <p>{product.description}</p>
          {product.provisional && (
            <p className="notice">
              Preço, nome e tamanhos provisórios. Confirma a disponibilidade por
              WhatsApp.
            </p>
          )}
          {product.releaseLabel ? (
            <p className="notice">
              Esta peça será lançada em {product.releaseLabel}. Fica atento às
              novidades da FRAN7.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAdd(
                  product,
                  String(new FormData(e.currentTarget).get("size")),
                );
              }}
            >
              <label>
                TAMANHO
                <select name="size" required defaultValue="">
                  <option value="" disabled>
                    Seleciona o teu tamanho
                  </option>
                  {product.sizes.split(",").map((s) => (
                    <option key={s} value={s.trim()}>
                      {s.trim()}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn dark" type="submit">
                <ShoppingBag size={18} /> Adicionar ao carrinho{" "}
                <Plus size={18} />
              </button>
            </form>
          )}
          <small>Entrega e pagamento combinados diretamente com a FRAN7.</small>
        </div>
      </div>
      <div className="comments">
        <h3>O que achaste desta peça?</h3>
        <p>Partilha a tua opinião com a comunidade FRAN7.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget,
              data = new FormData(form);
            add.mutate(
              {
                productId: product.id,
                name: String(data.get("name")),
                body: String(data.get("body")),
                website: "",
              },
              { onSuccess: () => form.reset() },
            );
          }}
        >
          <input
            name="name"
            placeholder="O teu nome"
            minLength={2}
            maxLength={50}
            required
            aria-label="O teu nome"
          />
          <textarea
            name="body"
            placeholder="Escreve um comentário..."
            minLength={3}
            maxLength={500}
            required
            aria-label="Comentário"
          />
          <small>
            O nome e o comentário serão públicos. Não incluas dados pessoais.
          </small>
          <button className="btn dark" disabled={add.isPending}>
            {add.isPending ? "A publicar..." : "Publicar comentário"}
          </button>
        </form>
        {add.isError && <p role="alert">{add.error.message}</p>}
        {add.isSuccess && <output>Comentário publicado.</output>}
        {comments.isLoading ? (
          <p>A carregar comentários...</p>
        ) : comments.isError ? (
          <p>Não foi possível carregar os comentários.</p>
        ) : comments.data?.length ? (
          comments.data.map((c) => (
            <article key={c.id}>
              <strong>{c.name}</strong>
              <time>{new Date(c.createdAt).toLocaleDateString("pt-PT")}</time>
              <p>{c.body}</p>
            </article>
          ))
        ) : (
          <p className="empty">Ainda não há comentários. Sê o primeiro.</p>
        )}
      </div>
    </Overlay>
  );
}
export function CartDialog({
  cart,
  products,
  onChange,
  onClose,
}: {
  cart: CartItem[];
  products: Product[];
  onChange: (items: CartItem[]) => void;
  onClose: () => void;
}) {
  const items = cart
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) }))
    .filter((i) => i.product);
  const total = items.reduce((sum, i) => sum + i.product!.price * i.qty, 0);
  const text =
    "Olá, FRAN7! Gostaria de encomendar:\n" +
    items
      .map(
        (i) =>
          `${i.qty}x ${i.product!.name} — tamanho ${i.size} — ${money(i.product!.price * i.qty)}`,
      )
      .join("\n") +
    "\nTotal indicativo: " +
    money(total) +
    "\nPodem confirmar stock, entrega e pagamento?";
  return (
    <Overlay drawer label="O teu carrinho" onClose={onClose}>
      <span className="eyebrow">AS TUAS ESCOLHAS</span>
      <h2>
        O teu carrinho
        <span className="muted"> ({items.reduce((s, i) => s + i.qty, 0)})</span>
      </h2>
      {!items.length ? (
        <div className="empty-cart">
          <ShoppingBag size={48} />
          <h3>O teu próximo estilo começa aqui.</h3>
          <p>Adiciona as tuas peças favoritas.</p>
          <button className="btn dark" onClick={onClose}>
            Explorar coleção
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((i) => (
              <article className="cart-item" key={i.id + i.size}>
                <img src={i.product!.image} alt={i.product!.name} />
                <div>
                  <h3>{i.product!.name}</h3>
                  <p>Tamanho {i.size}</p>
                  <strong>{money(i.product!.price)}</strong>
                  <div className="quantity">
                    <button
                      aria-label="Diminuir quantidade"
                      onClick={() =>
                        onChange(
                          cart
                            .map((c) =>
                              c.id === i.id && c.size === i.size
                                ? { ...c, qty: c.qty - 1 }
                                : c,
                            )
                            .filter((c) => c.qty > 0),
                        )
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span>{i.qty}</span>
                    <button
                      aria-label="Aumentar quantidade"
                      disabled={i.qty >= 99}
                      onClick={() =>
                        onChange(
                          cart.map((c) =>
                            c.id === i.id && c.size === i.size
                              ? { ...c, qty: c.qty + 1 }
                              : c,
                          ),
                        )
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  className="icon-btn"
                  aria-label="Remover produto"
                  onClick={() =>
                    onChange(
                      cart.filter((c) => !(c.id === i.id && c.size === i.size)),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>
          <div className="cart-bottom">
            <div>
              <span>Total indicativo</span>
              <strong>{money(total)}</strong>
            </div>
            <p>
              Preços provisórios sujeitos a confirmação. Entrega e pagamento
              serão combinados por WhatsApp.
            </p>
            <a
              className="btn dark"
              href={whatsapp + "?text=" + encodeURIComponent(text)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={19} /> Encomendar pelo WhatsApp
            </a>
            <small>
              A mensagem será enviada apenas quando a confirmares no WhatsApp.
            </small>
          </div>
        </>
      )}
    </Overlay>
  );
}
const policies: Record<string, { title: string; body: string[] }> = {
  Entregas: {
    title: "Entregas e pagamento",
    body: [
      "Antes de encomendar, contacta a FRAN7 pelo WhatsApp para confirmar stock, zona de entrega, custo e prazo.",
      "O site não processa pagamentos. O método de pagamento e a entrega são combinados diretamente com a equipa. Uma mensagem de WhatsApp não constitui confirmação automática da encomenda.",
    ],
  },
  Trocas: {
    title: "Trocas e devoluções",
    body: [
      "As condições e os prazos de troca e devolução ainda estão a ser definidos pela FRAN7. Confirma estas condições antes de efetuar qualquer pagamento.",
      "Se tiveres um problema com uma peça recebida, contacta a equipa com os detalhes da encomenda. Não são apresentados prazos ou garantias comerciais não confirmados.",
    ],
  },
  Privacidade: {
    title: "Privacidade",
    body: [
      "Este site guarda o carrinho e os favoritos no teu navegador. Os comentários e o nome que escolheste são guardados na base de dados e ficam públicos.",
      "O registo e a entrada de clientes usam e-mail e palavra-passe ou Google. As palavras-passe são guardadas de forma protegida, não em texto simples. O perfil guarda o nome, e-mail, telefone e aniversário opcionais e a preferência de receber novidades. Cada cliente só pode aceder ao seu perfil. A entrada na gestão usa autenticação Google. O site inclui medição de utilização fornecida pela plataforma Runable. Os links de WhatsApp, Instagram e YouTube levam a serviços externos com as suas próprias políticas.",
      "Para pedir a remoção de um comentário ou esclarecer o tratamento dos teus dados, escreve para fran7officiall@gmail.com. Esta informação deve ser revista pela FRAN7 antes da publicação.",
    ],
  },
  Termos: {
    title: "Termos da loja",
    body: [
      "As imagens são fornecidas pela FRAN7. Os nomes, preços e tamanhos identificados como provisórios são exemplos até validação da marca.",
      "A disponibilidade, o preço final, as condições de entrega e pagamento devem ser confirmados por WhatsApp. Não existe pagamento online nem confirmação automática de encomendas nesta versão.",
    ],
  },
};
export function PolicyDialog({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  const p = policies[name];
  return (
    <Overlay label={p.title} onClose={onClose}>
      <div className="policy">
        <span className="eyebrow">INFORMAÇÕES FRAN7</span>
        <h2>{p.title}</h2>
        <p className="notice">
          Versão provisória — sujeita a validação pela marca antes da
          publicação.
        </p>
        {p.body.map((b) => (
          <p key={b}>{b}</p>
        ))}
        <a href="mailto:fran7officiall@gmail.com">fran7officiall@gmail.com</a>
      </div>
    </Overlay>
  );
}
