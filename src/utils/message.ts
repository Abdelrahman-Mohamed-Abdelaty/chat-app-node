import moment from "moment";

export const generateMessage=(from:string,text:string)=>{
    return {
        from,
        text,
        createdAt:moment().valueOf()
    }
}
export const generateLocationMessage=(from:string,lat:string,long:string)=>{
    return{
        from,
        url:`https://www.google.com/maps/?q=${lat},${long}`,
        createdAt:moment().valueOf()
    }
}
export const generateData = (from:string, data:any) => {
    return {
        from,
        url: data,
        createdAt: moment().valueOf()
    };
};
