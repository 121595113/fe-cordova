

function close(context, func, params){
    return function(){
        let args = params||arguments;
        return func.apply(context,args);
    }
}


export {
    close
};