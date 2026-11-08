import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../../index.html',import.meta.url),'utf8');
const script=html.match(/<script data-startup-recovery>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);
function setup({active=false,storageAvailable=true}:{active?:boolean;storageAvailable?:boolean}={}){
 const listeners=new Map<string,(event:any)=>void>(),storage=new Map<string,string>(),elements=new Map<string,Element>();let reloads=0;
 class Element{
  id='';tagName:string;style:{cssText:string;margin:string}={cssText:'',margin:''};textContent='';type='';attrs:Record<string,string>={};children:Element[]=[];
  constructor(tag:string){this.tagName=tag.toUpperCase();}
  setAttribute(key:string,value:string){this.attrs[key]=value;}
  getAttribute(key:string){return this.attrs[key]??null;}
  addEventListener(){}
  append(...nodes:Element[]){for(const node of nodes){this.children.push(node);if(node.id)elements.set(node.id,node);}}
  hasChildNodes(){return active;}
 }
 const root=new Element('div');elements.set('root',root);const body=new Element('body');
 const window={addEventListener(type:string,listener:(event:any)=>void){listeners.set(type,listener);},setTimeout(){}};
 const location={href:'https://game.example/',origin:'https://game.example',reload(){reloads++;}};
 const sessionStorage={getItem(key:string){if(!storageAvailable)throw Error('storage denied');return storage.get(key)??null;},setItem(key:string,value:string){if(!storageAvailable)throw Error('storage denied');storage.set(key,value);}};
 const document={getElementById:(id:string)=>elements.get(id)??null,createElement:(tag:string)=>new Element(tag),body,documentElement:body};
 runInNewContext(script!,{window,location,sessionStorage,document,HTMLElement:Element,URL,Date});
 const failModule=()=>{const script=new Element('script');script.setAttribute('type','module');script.setAttribute('src','/assets/old.js');listeners.get('error')?.({target:script});};
 return {failModule,preloadError:()=>listeners.get('vite:preloadError')?.({}),recovery:()=>elements.has('startup-recovery'),reloads:()=>reloads};
}
test('起動時の古いモジュール読み込み失敗は一度だけ再読み込みし、再失敗時は操作を表示する',()=>{
 const state=setup();state.failModule();assert.equal(state.reloads(),1);state.failModule();assert.equal(state.reloads(),1);assert.equal(state.recovery(),true);
});
test('プレイ画面では自動再読み込みせず、復旧操作を表示する',()=>{
 const state=setup({active:true});state.failModule();assert.equal(state.reloads(),0);assert.equal(state.recovery(),true);
 const dynamic=setup({active:true});dynamic.preloadError();assert.equal(dynamic.reloads(),0);assert.equal(dynamic.recovery(),true);
});
test('セッション保存を使えない場合もループせず、復旧操作を表示する',()=>{
 const state=setup({storageAvailable:false});state.failModule();assert.equal(state.reloads(),0);assert.equal(state.recovery(),true);
});
