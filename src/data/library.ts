import {parts,categories,type Category,type Part} from './parts';
import {modelShops} from './world';
import {isStocked} from './progression';
import {mechanicMotorStages} from './mechanicMotor';
export const libraryGuides:Record<Category,{title:string;text:string}>={
 motor:{title:'回転数とトルクは別の性能',text:'回転数（rpm）は最高速の目安。トルクは発進・登坂・砂地で押し出す力。回転数だけ高くても負荷に負けると失速する。通常モーターは約60秒の慣らしで好調になり、その後は摩耗する。消耗なしの型は慣らし不要。慣らしでは電池残量は減らない。'},
 gear:{title:'ギア比が大きいほど力、小さいほど最高速',text:'5:1はモーター5回転でタイヤが1回転する減速比。5:1→4:1→3.5:1と小さくすると理論最高速は上がるが、車輪を押す力は減る。同じモーターなら5:1は発進・坂・砂地に、3.5:1は抵抗の少ない高速区間に向く。速さと駆動力の両立を見て選ぼう。'},
 body:{title:'空気抵抗と路面への相性',text:'空気抵抗は小さいほど高速で有利。旋回・悪路接地は大きいほど支えになり、悪路抵抗は小さいほど砂や砂利で力を失いにくい。軽さだけでなくコースに合う形を選ぶ。専用ボディや非売品も閲覧できる。'},
 chassis:{title:'重さ・駆動効率・安定性を比べる',text:'軽量型は加速、低重心型は旋回を助ける。駆動効率と安定性は大きいほど有利。制振・接地のある型は凹凸や着地を支える。モーターが強くてもシャーシとの相性で走りは変わる。'},
 battery:{title:'出力と持続は別に比べる',text:'出力はモーターの力と速さに影響する。持続係数が大きい電池は長距離向き。持続係数は固定の完走保証時間ではなく、残量は使用時間で低下する。リチウムセルは出力が弱い代わりに残量100%固定。新品交換と所持個体の状態も確認しよう。'},
 tire:{title:'径・グリップ・接地の違い',text:'大径ほど同じ回転数で進む距離が増えるが、押し出す力の面では負担になる。グリップは旋回、接地追従は凹凸に関わる。悪路抵抗が小さいタイヤは砂地向き。舗装抵抗が大きいと舗装上で速度を失う。'},
 wheel:{title:'タイヤとホイールは別パーツ',text:'軽量ホイールは重量を減らし、ワンウェイ機構はコーナーの内外輪の回転差を逃がす。旋回抵抗は小さいほど有利。接地や制振の違いも確認し、タイヤの特性と合わせて選ぼう。'},
 roller:{title:'摩擦と姿勢の安定',text:'壁に触れたときの摩擦は小さいほど速度を残しやすい。安定性・制振は姿勢や横揺れを支える。ローラーは1セット持っていれば前・中・後に共用できる。リアスライドを使う場合もリヤのローラーは別に装着する。'},
 shaft:{title:'駆動を伝える軸',text:'シャフトはモーターの力をタイヤへ伝える軸。重量と、型によって設定された駆動効率や接地への効果を比べる。中空などの軽量型はマシン全体の重量を減らせる。'},
 terminal:{title:'電力を届ける伝達効率',text:'端子の伝達効率が高いほど電池とモーターの性能を引き出しやすい。モーターだけを交換しても端子の損失は残る。重量と効率の両方を比べよう。'},
 accessory:{title:'補助パーツは役割の組み合わせ',text:'ウェイトは重量と安定、駆動サポートは効率、ダンパーは振動や着地、スタビライザーは姿勢を支える。その他3枠は異なる種類を最大3個。重量は足し算、効率などの倍率は組み合わせて働く。同種の重複装着はできない。'},
};
export const specGlossary:Record<string,{label:string;unit:string;meaning:string}>={
 rpm:{label:'回転数',unit:'rpm',meaning:'最高速の基準となる回転数'},torque:{label:'トルク',unit:'mN·m',meaning:'発進・坂・抵抗に対抗する力'},weight:{label:'重量',unit:'g',meaning:'装着時に加わる重量'},wear:{label:'摩耗係数',unit:'×',meaning:'0は消耗なし・慣らし不要'},efficiency:{label:'駆動・伝達効率',unit:'×',meaning:'大きいほど駆動の損失が少ない'},stability:{label:'安定性',unit:'×',meaning:'大きいほど旋回時の姿勢を支える'},damping:{label:'制振',unit:'%',meaning:'振動や着地の衝撃を抑える'},roughGrip:{label:'悪路接地',unit:'×',meaning:'大きいほど悪路で接地を保つ'},roughResistance:{label:'悪路抵抗',unit:'×',meaning:'小さいほど砂・砂利の抵抗を抑える'},compliance:{label:'接地追従',unit:'×',meaning:'大きいほど凹凸に追従する'},diameter:{label:'直径',unit:'mm',meaning:'タイヤ径またはホイールのリム径'},grip:{label:'グリップ',unit:'',meaning:'旋回時の接地の基準'},pavedDrag:{label:'舗装抵抗',unit:'',meaning:'小さいほど舗装で転がりやすい'},cornerDrag:{label:'旋回抵抗',unit:'×',meaning:'小さいほどコーナーで速度を残す'},friction:{label:'摩擦係数',unit:'',meaning:'小さいほど壁との接触抵抗を抑える'},power:{label:'出力',unit:'×',meaning:'モーターの力と速さへの倍率'},endurance:{label:'持続係数',unit:'秒',meaning:'残量低下の基準。大きいほど長距離向き'},ratio:{label:'減速比',unit:':1',meaning:'大きいほど駆動力、小さいほど理論最高速'},drag:{label:'空気抵抗',unit:'×',meaning:'小さいほど高速で空気抵抗が少ない'},frontMotor:{label:'モーター配置',unit:'',meaning:'1はフロントモーター（FM）、未設定は従来の後置き'},consumption:{label:'消耗係数',unit:'×',meaning:'0の電池は残量が減らない'},
};
export function formatSpec(key:string,value:number){if(key==='frontMotor')return value===1?'前置き（FM）':'後置き（RM）';const unit=specGlossary[key]?.unit??'';const number=key==='damping'?Math.round(value*10000)/100:value;return unit==='×'?`×${number.toLocaleString('ja-JP',{maximumFractionDigits:4})}`:unit===':1'?`${number}:1`:`${number.toLocaleString('ja-JP',{maximumFractionDigits:4})}${unit?' '+unit:''}`;}
export function librarySource(part:Part){
 const stage=mechanicMotorStages.find(s=>s.id===part.id);if(stage)return `メカニックマンからの贈り物・成長段階${stage.level}（熟練度${stage.points}pt${stage.level===9?'・単独1位':''}）`;
 if(part.id==='motor-rescue'||part.id==='battery-recharge')return 'セッティングで無料装着';
 if(part.id==='accessory-none')return 'セッティングで補助パーツを外す';
 if(part.id==='body-champion')return '青葉博士からの贈り物';
 if(part.id==='body-entry')return '最初から所持';
 if(part.id.startsWith('body-legend-'))return '取扱：ほしくず模型店（ゲームクリア後）';
 const shops=Object.values(modelShops).filter(s=>isStocked(part,s)).sort((a,b)=>a.stage-b.stage);
 return shops.length?`取扱：${shops.map(s=>s.name).join('・')}`:'非売品';
}
export function searchLibrary(category:Category|'all',query:string){const terms=query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);return parts.filter(p=>(category==='all'||p.category===category)&&terms.every(term=>`${p.category==='gear'?'ギア比':''} ${p.name} ${categories[p.category]} ${p.description} ${p.performance} ${librarySource(p)} ${Object.keys(p.specs).map(k=>specGlossary[k]?.label??k).join(' ')}`.normalize('NFKC').toLocaleLowerCase().includes(term)));}
