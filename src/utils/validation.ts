export const isRealString=(str:any):boolean=>{
    return typeof str==="string" && str.trim().length>0;
}