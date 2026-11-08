export const doctor={name:'青葉 源蔵',role:'小型四駆研究家・青葉博士'};
export const doctorGiftBody='body-champion';
export const doctorGiftMessage='おお、君が湊くんだね。私は小型四駆を研究している青葉源蔵じゃ。あの兄弟に挑み、最後まで走った勇気を見せてもらったよ。これからの挑戦に、この「セイラン Vortex GT」を役立ててくれ！\n\nセイラン Vortex GTを受け取った！ 作業台のボディ欄で装着できる。今のボディはそのまま残るぞ。';

export const doctorSpot={x:520,y:430};
export function doctorAdvice(body:string){
  return body===doctorGiftBody
    ?'セイランを装着したようじゃな！ ボディだけでなく、モーターの慣らしと電池の残量も大切じゃ。前・中・後のローラーもコースに合わせて調整してごらん。前のレースの詳しい診断は佐伯匠くんに相談するとよいぞ。あおぞら模型店で、さらに速い走りを探しておいで。'
    :'贈ったセイラン Vortex GTは、作業台のボディ欄で装着できるぞ。今のボディも残るので、走りを比べてみるとよい。モーターと電池は種類ごとに1個ずつ持てる。慣らしや残量を確かめて、次の模型店へ挑戦するのじゃ！';
}
