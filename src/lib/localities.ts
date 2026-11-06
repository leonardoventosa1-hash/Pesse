export type Locality = {slug:string;name:string;area:"La Matanza"|"Zona oeste"};
export const LOCALITIES:readonly Locality[] = [
 {slug:"san-justo",name:"San Justo",area:"La Matanza"},
 {slug:"ramos-mejia",name:"Ramos Mejía",area:"La Matanza"},
 {slug:"gregorio-de-laferrere",name:"Gregorio de Laferrere",area:"La Matanza"},
 {slug:"isidro-casanova",name:"Isidro Casanova",area:"La Matanza"},
 {slug:"gonzalez-catan",name:"González Catán",area:"La Matanza"},
 {slug:"ciudad-evita",name:"Ciudad Evita",area:"La Matanza"},
 {slug:"villa-luzuriaga",name:"Villa Luzuriaga",area:"La Matanza"},
 {slug:"lomas-del-mirador",name:"Lomas del Mirador",area:"La Matanza"},
 {slug:"rafael-castillo",name:"Rafael Castillo",area:"La Matanza"},
 {slug:"tapiales",name:"Tapiales",area:"La Matanza"},
 {slug:"la-tablada",name:"La Tablada",area:"La Matanza"},
 {slug:"virrey-del-pino",name:"Virrey del Pino",area:"La Matanza"},
 {slug:"moron",name:"Morón",area:"Zona oeste"},
 {slug:"haedo",name:"Haedo",area:"Zona oeste"},
 {slug:"castelar",name:"Castelar",area:"Zona oeste"},
 {slug:"ituzaingo",name:"Ituzaingó",area:"Zona oeste"},
 {slug:"merlo",name:"Merlo",area:"Zona oeste"},
 {slug:"moreno",name:"Moreno",area:"Zona oeste"},
 {slug:"hurlingham",name:"Hurlingham",area:"Zona oeste"},
 {slug:"villa-tesei",name:"Villa Tesei",area:"Zona oeste"},
 {slug:"william-c-morris",name:"William C. Morris",area:"Zona oeste"},
 {slug:"caseros",name:"Caseros",area:"Zona oeste"},
 {slug:"ciudadela",name:"Ciudadela",area:"Zona oeste"},
 {slug:"santos-lugares",name:"Santos Lugares",area:"Zona oeste"},
 {slug:"villa-bosch",name:"Villa Bosch",area:"Zona oeste"},
 {slug:"martin-coronado",name:"Martín Coronado",area:"Zona oeste"},
 {slug:"pablo-podesta",name:"Pablo Podestá",area:"Zona oeste"},
 {slug:"loma-hermosa",name:"Loma Hermosa",area:"Zona oeste"}
] as const;
export const localityBySlug=(slug:string)=>LOCALITIES.find(locality=>locality.slug===slug);

/**
 * Agrupación de cobertura por partido bonaerense.
 * Conserva locality_slug en las noticias existentes para no alterar datos.
 */
export type Partido={slug:string;name:string;localitySlugs:readonly string[]};
export const PARTIDOS:readonly Partido[]=[
 {slug:"la-matanza",name:"La Matanza",localitySlugs:LOCALITIES.filter(l=>l.area==="La Matanza").map(l=>l.slug)},
 {slug:"moron",name:"Morón",localitySlugs:["moron","haedo","castelar"]},
 {slug:"ituzaingo",name:"Ituzaingó",localitySlugs:["ituzaingo"]},
 {slug:"merlo",name:"Merlo",localitySlugs:["merlo"]},
 {slug:"moreno",name:"Moreno",localitySlugs:["moreno"]},
 {slug:"hurlingham",name:"Hurlingham",localitySlugs:["hurlingham","villa-tesei","william-c-morris"]},
 {slug:"tres-de-febrero",name:"Tres de Febrero",localitySlugs:["caseros","ciudadela","santos-lugares","villa-bosch","martin-coronado","pablo-podesta","loma-hermosa"]}
] as const;
export const partidoBySlug=(slug:string)=>PARTIDOS.find(p=>p.slug===slug);
