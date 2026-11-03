export default function Loading() {
  return <main className="container main" role="status" aria-live="polite" aria-busy="true">
    <div className="eyebrow">PESSE · PERIODISMO DIGITAL</div>
    <h1 style={{fontSize:"clamp(30px,5vw,48px)"}}>Cargando noticias…</h1>
    <p className="muted">Estamos preparando el contenido para vos.</p>
  </main>;
}
