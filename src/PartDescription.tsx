import type { Part } from './data/parts';
import { partGuidance } from './data/partGuidance';
import './part-description.css';
export function PartDescription({part}:{part:Part}){
 const advice=partGuidance(part);
 return <div className="part-description"><p><strong>説明</strong>{part.description}</p><p><strong>使いどころ</strong>{advice.use}</p><p><strong>注意点</strong>{advice.tradeoff}</p><small>{part.performance}</small></div>;
}
