"use client";
type Check={label:string;ok:boolean;detail:string};
type Props={
 title:string;slug:string;excerpt:string;body:string;category:string;
 cover:string;coverCaption:string;coverCredit:string;authorName:string;status:"draft"|"published";
};
export default function EditorialReview({title,slug,excerpt,body,category,cover,coverCaption,coverCredit,authorName,status}:Props){
 const required:Check[]=[
  {label:"Título",ok:title.trim().length>=8,detail:"Al menos 8 caracteres"},
  {label:"Dirección de la noticia",ok:!!slug.trim(),detail:"URL amigable para el artículo"},
  {label:"Bajada",ok:excerpt.trim().length>=20,detail:"Al menos 20 caracteres"},
  {label:"Cuerpo del artículo",ok:body.trim().length>=40,detail:"Al menos 40 caracteres"},
  {label:"Categoría",ok:!!category,detail:"Elegí la sección correspondiente"}
 ];
 const images=body.split(/\n\s*\n/).map(block=>block.trim().match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/)).filter((match):match is RegExpMatchArray=>match!==null);
 const missingAlt=images.filter(match=>!match[1].trim()).length;
 const hasLink=/\[[^\]]+\]\(https?:\/\/[^\s)]+\)/i.test(body);
 const advisory:Check[]=[
  {label:"Portada",ok:!!cover.trim(),detail:"Recomendada para la página y las redes sociales"},
  {label:"Descripción de portada",ok:!cover.trim()||!!coverCaption.trim(),detail:"Ayuda a contextualizar la fotografía principal"},
  {label:"Crédito de portada",ok:!cover.trim()||!!coverCredit.trim(),detail:"Identificá al autor o la fuente cuando corresponda"},
  {label:"Descripciones de fotos internas",ok:missingAlt===0,detail:missingAlt?missingAlt+" fotografía(s) sin descripción":"Todas las fotos internas tienen descripción"},
  {label:"Enlaces a fuentes",ok:hasLink,detail:"Revisá fuentes y enlaces cuando la noticia lo requiera"},
  {label:"Firma editorial",ok:!!authorName.trim(),detail:"Opcional: sin firma aparece Pesse"}
 ];
 const missingRequired=required.filter(check=>!check.ok).length;
 const warnings=advisory.filter(check=>!check.ok).length;
 return <section aria-label="Lista de verificación editorial" className="editorial-review">
  <div className="editorial-review-heading">
   <div><h2>Revisión editorial</h2><p>Control de campos y presentación. No verifica la veracidad de los datos ni reemplaza la revisión periodística.</p></div>
   <strong className={missingRequired?"editorial-review-count editorial-review-count--pending":"editorial-review-count"}>{missingRequired?missingRequired+" pendiente(s)":"Requisitos completos"}</strong>
  </div>
  <div className="editorial-review-groups">
   <div className="editorial-review-group">
    <h3>Requisitos para publicar</h3>
    <ul>{required.map(check=><li key={check.label} className={check.ok?"is-ready":"is-pending"}><span aria-hidden="true">{check.ok?"✓":"!"}</span><div><strong>{check.label}</strong><small>{check.detail}</small></div></li>)}</ul>
   </div>
   <div className="editorial-review-group">
    <h3>Recomendaciones de calidad</h3>
    <ul>{advisory.map(check=><li key={check.label} className={check.ok?"is-ready":"is-advisory"}><span aria-hidden="true">{check.ok?"✓":"○"}</span><div><strong>{check.label}</strong><small>{check.detail}</small></div></li>)}</ul>
   </div>
  </div>
  <p className="editorial-review-summary" role="status">{missingRequired
   ? "Faltan "+missingRequired+" requisito(s) para publicar. Podés continuar redactando y guardar el borrador."
   : status==="published"?"Los requisitos obligatorios están completos. Para publicar todavía tendrás que confirmar la acción.":"Los requisitos obligatorios están completos. Podés seguir trabajando como borrador o elegir publicar."
  } {warnings?"Hay "+warnings+" recomendación(es) por revisar.":""}</p>
 </section>;
}
