export const dynamic="force-dynamic";
import VideoShowcase from "@/components/VideoShowcase";
export const metadata={
 title:"Videos, entrevistas y Pesse Stream | Pesse",
 description:"Mirá entrevistas, programas y coberturas audiovisuales de Pesse. Encontrá videos oficiales y visitá nuestro canal de YouTube."
};
export default function Videos(){
 return <main className="container main pesse-videos-page"><VideoShowcase full/></main>;
}
