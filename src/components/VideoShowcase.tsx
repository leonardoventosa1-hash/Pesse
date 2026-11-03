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
   <span className="pesse-video-kicker">PESSE AUDIOVISUAL <span aria-hidden="true">·</span> YOUTUBE</span>
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
   <div><span className="pesse-videos-overline"><span className="pesse-videos-live-dot" aria-hidden="true"/> PERIODISMO EN VIDEO</span>
    {full?<h1 id="video-page-title">Pesse <em>audiovisual.</em></h1>:<h2 id="home-video-title">Pesse <em>audiovisual.</em></h2>}
    <p>Actualidad, entrevistas, coberturas y nuevas conversaciones para mirar con otra perspectiva.</p>
   </div>
   <a href={channel} target="_blank" rel="noopener noreferrer" className="pesse-video-channel">Ir a nuestro YouTube <span aria-hidden="true">↗</span></a>
  </div>
  {selected.length>0?<div className="pesse-video-grid">
   {selected.map((video,index)=><VideoCard key={video.id} video={video} primary={index===0}/>)}
  </div>:<div className="pesse-video-empty">
    <div className="pesse-video-empty-art" aria-hidden="true"><span>▶</span><strong>PESSE</strong></div>
    <div><span className="pesse-video-kicker">NUESTRA COMUNIDAD EN YOUTUBE</span>
     <h3>Las historias también se cuentan en pantalla.</h3>
     <p>Programas, entrevistas y coberturas de Pesse. Explorá nuestro canal mientras seguimos sumando videos a esta sección.</p>
     <a className="pesse-video-channel" href={channel} target="_blank" rel="noopener noreferrer">Explorar canal de YouTube <span aria-hidden="true">↗</span></a>
    </div>
   </div>}
  {!full&&selected.length>0&&<div className="pesse-video-foot"><Link href="/videos" className="pesse-video-all">Explorar todos los videos <span aria-hidden="true">↗</span></Link></div>}
 </section>;
}
