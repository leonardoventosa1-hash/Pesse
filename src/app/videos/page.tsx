export const dynamic="force-dynamic";
import VideoShowcase from "@/components/VideoShowcase";
export const metadata={
 title:"Pesse Stream | Programas y videos",
 description:"Mirá Pesse Stream, sus programas y mejores momentos, junto a entrevistas y coberturas de Pesse en YouTube."
};
export default function Videos(){
 return <main className="container main pesse-videos-page"><VideoShowcase full/></main>;
}
