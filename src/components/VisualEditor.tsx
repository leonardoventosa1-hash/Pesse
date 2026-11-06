"use client";
import {useEffect,useRef,useState} from "react";

type Props={value:string;onChange:(next:string)=>void;label:string;compact?:boolean;placeholder?:string};
const escapeHtml=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function inlineHtml(s:string){
 return escapeHtml(s).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
 .replace(/__([^_]+)__/g,"<u>$1</u>").replace(/\*([^*\n]+)\*/g,"<em>$1</em>")
 .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,(_match,label,url)=>'<a href="'+escapeHtml(url)+'">'+label+'</a>');
}
function toHtml(value:string,compact:boolean){
 if(compact)return "<p>"+inlineHtml(value||"").replace(/\n/g,"<br>")+"</p>";
 const prefix=/^!\[[^\]]*\]\(https?:\/\/[^\s)]+\)/.test((value||"").trim())?'<p class="visual-editor-writing-line"><br></p>':"";
 return prefix+(value||"").split(/\n\s*\n/).map(block=>{
  const line=block.trim();
  const image=line.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
  if(image)return '<figure contenteditable="false"><img src="'+escapeHtml(image[2])+'" alt="'+escapeHtml(image[1])+'"/><figcaption>'+escapeHtml(image[1])+'</figcaption></figure><p class="visual-editor-writing-line"><br></p>';
  if(line.startsWith("## "))return "<h2>"+inlineHtml(line.slice(3))+"</h2>";
  if(line.startsWith("### "))return "<h3>"+inlineHtml(line.slice(4))+"</h3>";
  if(line.startsWith("> "))return "<blockquote>"+inlineHtml(line.slice(2))+"</blockquote>";
  return "<p>"+line.split("\n").map(inlineHtml).join("<br>")+"</p>";
 }).join("")||"<p><br></p>";
}
function parseInline(node:Node):string{
 if(node.nodeType===Node.TEXT_NODE)return node.textContent||"";
 if(!(node instanceof HTMLElement))return "";
 const text=Array.from(node.childNodes).map(parseInline).join("");
 if(node.tagName==="BR")return "\n";
 if(node.tagName==="STRONG"||node.tagName==="B")return "**"+text+"**";
 if(node.tagName==="EM"||node.tagName==="I")return "*"+text+"*";
 if(node.tagName==="U")return "__"+text+"__";
 if(node.tagName==="A"){const href=node.getAttribute("href")||"";return /^https?:\/\//i.test(href)?"["+text+"]("+href+")":text}
 if(node.tagName==="SPAN"){const style=node.style;const weight=style.fontWeight;const isBold=weight==="bold"||Number(weight)>=600;const isItalic=style.fontStyle==="italic";const isUnderlined=style.textDecorationLine.includes("underline")||style.textDecoration.includes("underline");let result=text;if(isBold)result="**"+result+"**";if(isItalic)result="*"+result+"*";if(isUnderlined)result="__"+result+"__";return result}
 return text;
}
function toMarkdown(root:HTMLElement,compact:boolean){
 if(compact)return Array.from(root.childNodes).map(node=>{if(node instanceof HTMLElement&&["P","DIV"].includes(node.tagName))return Array.from(node.childNodes).map(parseInline).join("");return parseInline(node)}).filter(Boolean).join("\n").trim();
 const parts:string[]=[];
 for(const child of Array.from(root.childNodes)){
  if(child.nodeType===Node.TEXT_NODE){if(child.textContent?.trim())parts.push(child.textContent.trim());continue}
  if(!(child instanceof HTMLElement))continue;
  if(child.tagName==="FIGURE"){
   const img=child.querySelector("img");if(img){const src=img.getAttribute("src")||"";if(/^https?:\/\//i.test(src))parts.push("!["+(img.getAttribute("alt")||"").replace(/[\[\]]/g,"")+"]("+src+")")}continue
  }
  const content=Array.from(child.childNodes).map(parseInline).join("").trim();
  if(!content)continue;
  if(child.tagName==="H2")parts.push("## "+content);
  else if(child.tagName==="H3")parts.push("### "+content);
  else if(child.tagName==="BLOCKQUOTE")parts.push("> "+content);
  else parts.push(content);
 }
 return parts.join("\n\n");
}
export default function VisualEditor({value,onChange,label,compact=false,placeholder}:Props){
 const ref=useRef<HTMLDivElement>(null),last=useRef<string|null>(null),dirty=useRef(false);
 const [selectionMenu,setSelectionMenu]=useState<{top:number;left:number}|null>(null);
 const [sourceMode,setSourceMode]=useState(false);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  if(value!==last.current){el.innerHTML=toHtml(value,compact);last.current=value}
 },[value,compact]);
 function update(){const el=ref.current;if(!el||!dirty.current)return;const next=toMarkdown(el,compact);dirty.current=false;last.current=next;onChange(next)}
 function continueWriting(){
  const el=ref.current;if(!el)return;
  setSelectionMenu(null);
  let target=el.lastElementChild;
  if(!(target instanceof HTMLParagraphElement)){
   const paragraph=document.createElement("p");paragraph.className="visual-editor-writing-line";paragraph.appendChild(document.createElement("br"));el.appendChild(paragraph);target=paragraph
  }
  const selection=window.getSelection(),range=document.createRange();
  range.selectNodeContents(target);range.collapse(true);
  el.focus();selection?.removeAllRanges();selection?.addRange(range);
  target.scrollIntoView({block:"nearest",behavior:"auto"});
 }
 function refreshSelection(){const el=ref.current,selection=window.getSelection();if(!el||!selection||selection.isCollapsed||!selection.rangeCount||!el.contains(selection.anchorNode)||!el.contains(selection.focusNode)){setSelectionMenu(null);return}const selectionRect=selection.getRangeAt(0).getBoundingClientRect();const editorRect=el.getBoundingClientRect();setSelectionMenu({top:Math.max(4,selectionRect.top-editorRect.top-47),left:Math.max(8,Math.min(selectionRect.left-editorRect.left,editorRect.width-220))})}
 function command(name:string){
  const el=ref.current;if(!el)return;el.focus();
  if(name==="link"){const selection=window.getSelection();const savedRange=selection&&selection.rangeCount&&el.contains(selection.anchorNode)&&el.contains(selection.focusNode)?selection.getRangeAt(0).cloneRange():null;const url=window.prompt("Dirección del enlace (https://):","https://");if(!url)return;try{const parsed=new URL(url);if(!["https:","http:"].includes(parsed.protocol))return;if(savedRange&&selection){el.focus();selection.removeAllRanges();selection.addRange(savedRange)}document.execCommand("createLink",false,parsed.href)}catch{return}}
  else if(name==="h2"||name==="quote")document.execCommand("formatBlock",false,name==="h2"?"h2":"blockquote");
  else document.execCommand(name,false);
  dirty.current=true;update();setSelectionMenu(null)
 }
 return <section className="visual-editor" aria-label={label}>
  <div className="visual-editor-tools" role="toolbar" aria-label={"Formato de "+label}>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("bold")} title="Negrita"><b>N</b></button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("italic")} title="Cursiva"><i>C</i></button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("underline")} title="Subrayado"><u>S</u></button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("link")}>Enlace</button>
   {!compact&&<><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("h2")}>Subtítulo</button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("quote")}>Cita</button><button type="button" className="visual-editor-continue" onMouseDown={e=>e.preventDefault()} onClick={continueWriting} title="Colocar el cursor después de la última fotografía">Escribir debajo de las fotos</button></>}
   <button type="button" className="visual-editor-mode" onClick={()=>{setSelectionMenu(null);setSourceMode(prev=>!prev)}} aria-pressed={sourceMode}>{sourceMode?"Volver a vista visual":"Ver código del texto"}</button>
  </div>
  {sourceMode&&<div className="visual-editor-source"><label>Modo de texto original<textarea value={value} onChange={e=>{dirty.current=false;last.current=null;onChange(e.target.value)}} rows={compact?5:16} spellCheck/></label><small>Este modo muestra el formato interno de la noticia. Volvé a la vista visual para seguir redactando normalmente.</small></div>}
  <div className="visual-editor-content" style={sourceMode?{display:"none"}:undefined}><div ref={ref} className={"visual-editor-surface"+(compact?" compact":"")} onMouseUp={refreshSelection} onKeyUp={refreshSelection} contentEditable role="textbox" aria-label={label} aria-multiline="true" data-placeholder={placeholder||"Escribí acá..."} onInput={()=>{dirty.current=true;update()}} onBlur={update} onPaste={e=>{e.preventDefault();document.execCommand("insertText",false,e.clipboardData.getData("text/plain"))}} suppressContentEditableWarning/>
   {selectionMenu&&<div className="visual-editor-floating" style={{top:selectionMenu.top,left:selectionMenu.left}} role="toolbar" aria-label="Dar formato a la selección">
    <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("bold")} title="Negrita"><b>N</b></button>
    <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("italic")} title="Cursiva"><i>C</i></button>
    <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("underline")} title="Subrayado"><u>S</u></button>
    <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("link")}>Enlace</button>
   </div>}</div>
 </section>
}
