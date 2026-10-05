export async function prepareReportPhoto(file:File):Promise<string>{
 if(!file.type.startsWith('image/'))throw new Error('Choose a photo.');
 if(file.size>25*1024*1024)throw new Error('Choose a photo smaller than 25 MB.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;await image.decode();
  const scale=Math.min(1,1280/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d');if(!context)throw new Error('Photo preparation unavailable.');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  for(const quality of [.8,.6,.4]){const data=canvas.toDataURL('image/jpeg',quality).split(',')[1];if(data.length<=1398104)return data;}
  throw new Error('This photo is too large. Please choose another.');
 }catch(error){throw new Error(error instanceof Error&&error.message.includes('too large')?error.message:'Could not prepare this photo. Try another image.');}
 finally{URL.revokeObjectURL(url);}
}
