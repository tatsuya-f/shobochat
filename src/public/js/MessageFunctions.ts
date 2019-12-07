export function checkInput(a): boolean{
    if(a==="")return false; 
    else{
        let space: boolean = false;
        let m: number = 0;
        while(m <= a.length-1){
            if(a.charAt(m)!==" " && a.charAt(m)!=="	")space = true;
            m++;
        }
        return space;
    }
}
