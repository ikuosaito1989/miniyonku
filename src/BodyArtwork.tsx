import { useEffect, useState } from 'react';

// 一覧とプレビューで同じ3Dモデルを共有。単一レンダラーで生成・キャッシュ。
export function BodyArtwork({id,color}:{id:string;color:string}){
  const [url,setUrl]=useState('');
  useEffect(()=>{
    let active=true;setUrl('');
    import('./game/bodyThumbnail').then(({bodyThumbnail})=>{
      if(!active)return;
      setUrl(bodyThumbnail(id,color));
    }).catch(()=>{ /* WebGL非対応時も名称と性能で部品を選べる。 */ });
    return()=>{active=false;};
  },[id,color]);
  return url?<image href={url} x="0" y="0" width="160" height="100"/>:<text x="80" y="52" textAnchor="middle" fontSize="10" fill="#d6e8ef" stroke="none">3D BODY</text>;
}
