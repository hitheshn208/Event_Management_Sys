exports.checkUSNformat = (usn)=>{
    const usnRegex = /^1MS\d{2}[A-Z]{2}\d{3}$/;

    if(!usnRegex.test(usn))
        return false;
    else
        return true;
}