import StoryCardCreator from "@/components/StoryCardCreator";
export default async function StoryPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <StoryCardCreator articleId={id}/>}
