import {activeBanners,mediaUrl,type Banner} from "@/lib/brand-ads";
export default async function SponsorPlacement({placement}:{placement:Banner["placement"]}){
 const banners=await activeBanners(placement);
 if(!banners.length)return null;
 return <section className="container" aria-label="Publicidad" style={{paddingTop:28,paddingBottom:28}}>
  <div style={{fontSize:11,color:"#66736c",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Contenido patrocinado · Publicidad</div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))",gap:16}}>
   {banners.map(banner=>{
    const image=mediaUrl(banner.image_path,"sponsors");
    if(!image)return null;
    return <a key={banner.id} href={banner.target_url} target="_blank" rel="noopener noreferrer sponsored" title={"Publicidad: "+banner.advertiser_name}
     style={{display:"block",borderRadius:12,overflow:"hidden",border:"1px solid #dde3dd",background:"#fff"}}>
      <img src={image} alt={banner.alt_text} loading="lazy" decoding="async" style={{display:"block",width:"100%",height:"auto",maxHeight:280,objectFit:"contain"}}/>
      <span style={{display:"block",padding:"8px 12px",fontSize:12,color:"#526258"}}>Anunciante: {banner.advertiser_name}</span>
    </a>;
   })}
  </div>
 </section>;
}
