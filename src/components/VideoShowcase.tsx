import Link from "next/link";
import {publishedVideos,videoCategoryLabels,youtubeThumbnailUrl,youtubeWatchUrl,type EditorialVideo} from "@/lib/editorial-videos";
import {getSiteSettings,validSocialUrl} from "@/lib/site-settings";

function VideoCard({video,primary=false}:{video:EditorialVideo;primary?:boolean}){
 return <a href={youtubeWatchUrl(video.youtube_id)} className={primary?"pesse-video-card pesse-video-feature":"pesse-video-card"} target="_blank" rel="noopener noreferrer" aria-label={"Ver en YouTube: "+video.title}>
  <div className="pesse-video-image">
   <img src={youtubeThumbnailUrl(video.youtube_id)} alt="" width={480} height={360} loading="lazy" decoding="async"/>
   <span className="pesse-video-play" aria-hidden="true">▶</span>
   <span className="pesse-video-image-label">{videoCategoryLabels[video.category]}</span>
  </div>
  <div className="pesse-video-text">
   <span className="pesse-video-kicker">PESSE STREAM <span aria-hidden="true">·</span> YOUTUBE</span>
   <h3>{video.title}</h3>
   {video.description&&<p>{video.description}</p>}
   <span className="pesse-video-watch">Ver video <span aria-hidden="true">↗</span></span>
  </div>
 </a>;
}
export default async function VideoShowcase({full=false}:{full?:boolean}){
 const [videos,settings]=await Promise.all([publishedVideos(full?24:3),getSiteSettings()]);
 const channel=validSocialUrl(settings.youtube_url,"youtube.com")?settings.youtube_url:"https://www.youtube.com/@pesseinfo";
 const selected=full?videos:videos.slice(0,3);
 return <section className={full?"pesse-videos-section pesse-videos-full":"pesse-videos-section"} aria-labelledby={full?"video-page-title":"home-video-title"}>
  <div className="pesse-videos-head">
   <div><span className="pesse-videos-overline"><span className="pesse-videos-live-dot" aria-hidden="true"/> PESSE EN VIVO Y EN VIDEO</span>
    {full?<h1 id="video-page-title">Pesse <em>Stream.</em></h1>:<h2 id="home-video-title">Pesse <em>Stream.</em></h2>}
    <p>Política, sociedad, economía y conversaciones que amplían la agenda. Mirá Pesse Stream y nuestras coberturas en YouTube.</p>
   </div>
   <a href={channel} target="_blank" rel="noopener noreferrer" className="pesse-video-channel">Ir a nuestro YouTube <span aria-hidden="true">↗</span></a>
  </div>
  {selected.length>0?<div className="pesse-video-grid">
   {selected.map((video,index)=><VideoCard key={video.id} video={video} primary={index===0}/>)}
  </div>:<div className="pesse-video-empty">
    <div className="pesse-video-empty-art" aria-hidden="true"><span>▶</span><strong>PESSE</strong></div>
    <div><span className="pesse-video-kicker">PESSE STREAM EN YOUTUBE</span>
     <h3>La actualidad también se conversa.</h3>
     <p>Seguí Pesse Stream en YouTube. Muy pronto vas a encontrar acá las emisiones y los mejores momentos del programa.</p>
     <a className="pesse-video-channel" href={channel} target="_blank" rel="noopener noreferrer">Explorar canal de YouTube <span aria-hidden="true">↗</span></a>
    </div>
   </div>}
  <aside className="pesse-stream-promo" aria-label="Pesse Stream">
   <div><span className="pesse-stream-promo-kicker">PESSE STREAM · CADA LUNES, 22:30 H</span>
    <h3>La actualidad también se debate.</h3>
    <p>Política, sociedad y los temas que atraviesan nuestra agenda. Sumate a la conversación por YouTube.</p>
   </div>
   <a href={channel} target="_blank" rel="noopener noreferrer" className="pesse-stream-promo-link">Seguir Pesse Stream <span aria-hidden="true">↗</span></a>
  </aside>
  {!full&&selected.length>0&&<div className="pesse-video-foot"><Link href="/videos" className="pesse-video-all">Explorar todos los videos <span aria-hidden="true">↗</span></Link></div>}
 </section>;
}
