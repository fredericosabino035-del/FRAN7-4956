import { useState } from "react";
import { Link } from "wouter";
import { authClient } from "../lib/auth";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Truck,
  ShieldCheck,
  Star,
  UserRound,
  SlidersHorizontal,
} from "lucide-react";
import { SiInstagram, SiWhatsapp, SiYoutube, SiGmail } from "react-icons/si";
import { useProducts } from "../queries/store";
import {
  ProductDialog,
  CartDialog,
  PolicyDialog,
} from "../components/store-dialogs";
import {
  useSaved,
  money,
  whatsapp,
  type Product,
  type CartItem,
} from "../lib/store";
const socials = [
  {
    name: "Instagram",
    href: "https://instagram.com/fran7.official",
    Icon: SiInstagram,
  },
  { name: "WhatsApp", href: whatsapp, Icon: SiWhatsapp },
  { name: "Gmail", href: "mailto:fran7officiall@gmail.com", Icon: SiGmail },
  {
    name: "YouTube",
    href: "https://youtube.com/@adelinosabino-ez5zp?si=7TWi18KysMiDoqDR",
    Icon: SiYoutube,
  },
];
export default function Storefront() {
  const products = useProducts();
  const { data: session } = authClient.useSession();
  const [category, setCategory] = useState("Todos"),
    [kind, setKind] = useState("Todas as peças"),
    [sort, setSort] = useState("Destaques"),
    [search, setSearch] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [onlyFav, setOnlyFav] = useState(false),
    [selected, setSelected] = useState<Product | null>(null),
    [cartOpen, setCartOpen] = useState(false),
    [policy, setPolicy] = useState("");
  const [cart, setCart] = useSaved<CartItem[]>("fran7_cart_v1", []),
    [favs, setFavs] = useSaved<number[]>("fran7_favs_v1", []);
  const all = products.data || [];
  let visible = all.filter(
    (p) =>
      (category === "Todos" ||
        p.category === category ||
        (p.category === "Unissexo" && category !== "Crianças")) &&
      (kind === "Todas as peças" || p.kind === kind) &&
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (!onlyFav || favs.includes(p.id)),
  );
  if (sort === "Preço: menor primeiro")
    visible = visible.toSorted((a, b) => a.price - b.price);
  if (sort === "Preço: maior primeiro")
    visible = visible.toSorted((a, b) => b.price - a.price);
  function collection(cat = "Todos") {
    setCategory(cat);
    setOnlyFav(false);
    setMenu(false);
    document.getElementById("colecao")?.scrollIntoView({ behavior: "smooth" });
  }
  function add(p: Product, size: string) {
    setCart((old) => {
      const found = old.find((i) => i.id === p.id && i.size === size);
      return found
        ? old.map((i) =>
            i === found ? { ...i, qty: Math.min(i.qty + 1, 99) } : i,
          )
        : [...old, { id: p.id, size, qty: 1 }];
    });
    setSelected(null);
    setCartOpen(true);
  }
  return (
    <>
      <div className="announcement">
        <span>FRAN7 — FEITA PARA O TEU PRÓXIMO PASSO.</span>
        <a href={whatsapp} target="_blank" rel="noreferrer">
          Encomenda pelo WhatsApp <ArrowUpRight size={12} />
        </a>
      </div>
      <header className="header">
        <a href="/" className="wordmark" aria-label="FRAN7 início">
          Fran
          <img className="brand-symbol" src="/images/symbol.png" alt="7" />
        </a>
        <nav className={menu ? "nav open" : "nav"}>
          {["Todos", "Mulheres", "Homens", "Crianças"].map((c) => (
            <button key={c} onClick={() => collection(c)}>
              {c === "Todos" ? "Nova coleção" : c}
            </button>
          ))}
          <a href="#marca" onClick={() => setMenu(false)}>
            A marca <ArrowUpRight size={12} />
          </a>
        </nav>
        <div className="header-actions">
          {session ? (
            <Link
              href="/perfil"
              className="account-link"
              aria-label="O teu perfil"
            >
              <UserRound size={20} />
              <span>Meu perfil</span>
            </Link>
          ) : (
            <div className="customer-entry">
              <Link href="/conta?modo=registo" className="registration-link">
                Registar-se
              </Link>
              <Link
                href="/conta"
                className="account-link"
                aria-label="Iniciar sessão"
              >
                <UserRound size={20} />
                <span>Iniciar sessão</span>
              </Link>
            </div>
          )}
          <button
            className="icon-btn"
            aria-label="Pesquisar"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={21} />
          </button>
          <button
            className={"icon-btn " + (onlyFav ? "active" : "")}
            aria-label="Ver favoritos"
            onClick={() => {
              setOnlyFav(!onlyFav);
              document
                .getElementById("colecao")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Heart size={21} />
            {favs.length > 0 && <span className="count">{favs.length}</span>}
          </button>
          <button
            className="icon-btn"
            aria-label="Abrir carrinho"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={21} />
            <span className="count">{cart.reduce((s, i) => s + i.qty, 0)}</span>
          </button>
          <button
            className="icon-btn menu-toggle"
            aria-label="Menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {searchOpen && (
        <div className="search-bar">
          <Search size={20} />
          <input
            aria-label="Pesquisar produtos"
            placeholder="Procura a tua próxima peça..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              document
                .getElementById("colecao")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <button
            className="icon-btn"
            aria-label="Fechar pesquisa"
            onClick={() => {
              setSearchOpen(false);
              setSearch("");
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}
      <main className="reference-store">
        <section className="hero reference-hero" id="inicio">
          <div className="hero-copy">
            <div className="eyebrow">FRAN7 — BUILD YOUR LEGACY</div>
            <h1>
              O TEU ESTILO.
              <br />
              <span>O TEU LEGADO.</span>
            </h1>
            <p>
              Uma coleção criada para acompanhar
              <br />o teu estilo, a tua energia e a tua evolução.
            </p>
          </div>
          <div className="hero-image">
            <img
              src="/images/runner.jpg"
              alt="Coleção FRAN7 — atleta em movimento"
            />
            <span className="image-label">BUILD YOUR LEGACY</span>
          </div>
          <button className="btn light" onClick={() => collection()}>
            EXPLORAR COLEÇÃO <ArrowUpRight size={21} />
          </button>
        </section>
        <div className="benefits">
          <div>
            <Truck size={22} />
            <span>
              O teu estilo, até ti<small>Entrega combinada por WhatsApp</small>
            </span>
          </div>
          <div>
            <ShieldCheck size={22} />
            <span>
              Identidade em cada detalhe
              <small>Peças com assinatura FRAN7</small>
            </span>
          </div>
          <div>
            <span>
              Estamos contigo<small>Atendimento direto e personalizado</small>
            </span>
          </div>
        </div>
        <section id="colecao" className="collection section">
          <div className="section-top">
            <div>
              <span className="eyebrow">01 / ENCONTRA O TEU ESTILO</span>
              <h2>
                {onlyFav ? "Os teus favoritos." : "Os teus novos essenciais."}
              </h2>
            </div>
            <p>
              Mais do que vestir.
              <br />
              Uma forma de ser.
            </p>
          </div>
          <div className="collection-tools">
            <div className="tabs">
              {["Todos", "Mulheres", "Homens", "Crianças"].map((c) => (
                <button
                  key={c}
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="selectors">
              <SlidersHorizontal size={16} />
              <select
                aria-label="Tipo de peça"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                {["Todas as peças", "T-shirts", "Bonés"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <select
                aria-label="Ordenar produtos"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {[
                  "Destaques",
                  "Preço: menor primeiro",
                  "Preço: maior primeiro",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="catalog-note">
            <span>
              {visible.length} PEÇAS {onlyFav ? "GUARDADAS" : "NA COLEÇÃO"}
            </span>
            <span>Catálogo inicial · preços e tamanhos a confirmar</span>
          </div>
          {products.isLoading ? (
            <div className="loading">A carregar a coleção...</div>
          ) : products.isError ? (
            <div className="empty">
              <p>Não foi possível carregar a coleção.</p>
              <button onClick={() => products.refetch()}>
                Tentar novamente
              </button>
            </div>
          ) : visible.length ? (
            <div className="product-grid">
              {visible.map((p, i) => (
                <article className="product" key={p.id}>
                  <div className="product-photo">
                    <button
                      className="photo-button"
                      onClick={() => setSelected(p)}
                      aria-label={"Ver " + p.name}
                    >
                      <img src={p.image} alt={p.name} loading="lazy" />
                    </button>
                    <span
                      className={
                        "product-tag" + (p.releaseLabel ? " release-tag" : "")
                      }
                    >
                      {p.releaseLabel ? (
                        <>
                          <Star size={12} fill="currentColor" /> BREVEMENTE
                        </>
                      ) : p.kind === "Bonés" ? (
                        "SIGNATURE"
                      ) : (
                        "NOVA COLEÇÃO"
                      )}
                    </span>
                    <button
                      className={
                        "favourite icon-btn " +
                        (favs.includes(p.id) ? "liked" : "")
                      }
                      aria-label={
                        favs.includes(p.id)
                          ? "Remover dos favoritos"
                          : "Adicionar aos favoritos"
                      }
                      aria-pressed={favs.includes(p.id)}
                      onClick={() =>
                        setFavs((f) =>
                          f.includes(p.id)
                            ? f.filter((id) => id !== p.id)
                            : [...f, p.id],
                        )
                      }
                    >
                      <Heart
                        size={19}
                        fill={favs.includes(p.id) ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      className="quick-add"
                      onClick={() => setSelected(p)}
                    >
                      {p.releaseLabel
                        ? "LANÇAMENTO EM " + p.releaseLabel.toUpperCase()
                        : "ESCOLHER TAMANHO"}{" "}
                      <PlusIcon />
                    </button>
                  </div>
                  <div className="product-meta">
                    <span>
                      {p.category.toUpperCase()} / {p.kind.toUpperCase()}
                    </span>
                    <span>0{i + 1}</span>
                  </div>
                  <div className="product-name">
                    <button onClick={() => setSelected(p)}>{p.name}</button>
                    <strong>{money(p.price)}</strong>
                  </div>
                  {p.releaseLabel && (
                    <small className="release-caption">
                      Lançamento em {p.releaseLabel}
                    </small>
                  )}
                  {p.provisional && (
                    <small className="provisional">Preço provisório</small>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>
                {category === "Crianças"
                  ? "Os pequenos também têm um grande legado."
                  : "Nenhuma peça encontrada."}
              </h3>
              <p>
                {category === "Crianças"
                  ? "A coleção infantil está a ser preparada. Fala connosco para saber mais."
                  : "Experimenta outra pesquisa ou categoria."}
              </p>
              <button
                className="btn dark"
                onClick={() => {
                  setCategory("Todos");
                  setKind("Todas as peças");
                  setSearch("");
                  setOnlyFav(false);
                }}
              >
                Ver toda a coleção <ArrowRight size={17} />
              </button>
            </div>
          )}
        </section>
        <section id="marca" className="brand">
          <div className="brand-photo">
            <img
              src="/images/start.jpg"
              alt="Atleta FRAN7 na linha de partida"
              loading="lazy"
            />
            <span>EVERY LEGACY STARTS WITH A STEP.</span>
          </div>
          <div className="brand-copy">
            <span className="eyebrow">02 / MAIS DO QUE UMA MARCA</span>
            <h2>
              NÃO SIGAS
              <br />O CAMINHO.
              <br />
              <span>CRIA O TEU.</span>
            </h2>
            <p>
              A FRAN7 nasce da vontade de ir mais longe. De transformar energia
              em atitude e estilo em identidade.
            </p>
            <p>
              Para quem não fica parado. Para quem acredita que o próximo passo
              pode mudar tudo.
            </p>
            <a
              className="text-link"
              href={socials[0].href}
              target="_blank"
              rel="noreferrer"
            >
              CONHECE O UNIVERSO FRAN7 <ArrowUpRight size={20} />
            </a>
          </div>
        </section>
        <section className="community section">
          <div>
            <span className="eyebrow">03 / FAZ PARTE DO MOVIMENTO</span>
            <h2>
              O legado continua.
              <br />
              Contigo.
            </h2>
            <p>
              Novidades, inspiração e os próximos lançamentos.
              <br />
              Encontra-nos nas nossas plataformas.
            </p>
          </div>
          <div className="social-links">
            {socials.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target={name === "Gmail" ? undefined : "_blank"}
                rel="noreferrer"
              >
                <Icon size={21} />
                <span>{name}</span>
                <ArrowUpRight size={20} />
              </a>
            ))}
          </div>
        </section>
      </main>
      <footer className="reference-footer">
        <div className="footer-top">
          <div>
            <a className="wordmark" href="/">
              Fran
              <img className="brand-symbol" src="/images/symbol.png" alt="7" />
            </a>
            <p>BUILD YOUR LEGACY.</p>
          </div>
          <div>
            <h4>EXPLORA</h4>
            {["Mulheres", "Homens", "Crianças"].map((c) => (
              <button key={c} onClick={() => collection(c)}>
                {c}
              </button>
            ))}
          </div>
          <div>
            <h4>INFORMAÇÕES</h4>
            {["Entregas", "Trocas", "Privacidade", "Termos"].map((x) => (
              <button key={x} onClick={() => setPolicy(x)}>
                {x === "Trocas" ? "Trocas e devoluções" : x}
              </button>
            ))}
          </div>
          <div>
            <h4>FALA CONNOSCO</h4>
            <a href="mailto:fran7officiall@gmail.com">
              fran7officiall@gmail.com
            </a>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              +244 973 560 521
            </a>
            <div className="footer-social">
              {socials.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 FRAN7. Todos os direitos reservados.</span>
          <span>O TEU ESTILO. O TEU LEGADO.</span>
          <a href="/gestao">
            Gestão da loja <ArrowUpRight size={12} />
          </a>
        </div>
      </footer>
      <a
        className="floating-whatsapp"
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar pelo WhatsApp"
      >
        <SiWhatsapp size={26} />
      </a>
      {selected && (
        <ProductDialog
          product={selected}
          onClose={() => setSelected(null)}
          onAdd={add}
        />
      )}{" "}
      {cartOpen && (
        <CartDialog
          cart={cart}
          products={all}
          onChange={setCart}
          onClose={() => setCartOpen(false)}
        />
      )}{" "}
      {policy && <PolicyDialog name={policy} onClose={() => setPolicy("")} />}
    </>
  );
}
function PlusIcon() {
  return (
    <span aria-hidden="true" style={{ fontSize: 21 }}>
      +
    </span>
  );
}
