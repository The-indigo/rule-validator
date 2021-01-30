const express= require('express')
const bodyParser=require('body-parser')
const _=require('lodash-getpath')
const app= express();



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use((req,res,next)=>{
    bodyParser.json()(req,res,err=>{
        if(err){
            return res.status(400).json({
                message: "Invalid JSON payload passed.",
                status: "error",
                data: null
              })
        }
        next();
    })
})
app.get('/',async(req,res)=>{
    try{
        res.json({message:"My Rule-Validation Api",status:"success",data:{
            name:"Adepoju Adeyemi Joshua", github:"@The-indigo",email:"adepojuadeyemi11@gmail.com",
            mobile:"08093919989", twitter:"@alkekenji"
        }})
    }catch(e){
        console.log(e)
    }
})

app.post("/validate-rule", async(req,res,next)=>{
const rule=req.body.rule
const data=req.body.data


if(rule===undefined){
  return  res.status(400).json({
        message:"rule is required.",
        status:"error",
        data:null
    })
}

if(data===undefined){
    return  res.status(400).json({
         message:"data is required.",
         status:"error",
         data:null
     })
 }

 
 if(Array.isArray(rule) || typeof(rule)!=='object'){
    return res.status(400).json({
        message: "rule should be an object.",
        status: "error",
        data: null
      })
}

 if(!("field" in rule)){
    return res.status(400).json ( {
                    message: "field field is required.",
                    status: "error",
                    data: null
                  })
}
if(!("condition" in rule)){
    return res.status(400).json ( {
                    message: "field condition is required.",
                    status: "error",
                    data: null
                  })
}
if(!("condition_value" in rule)){
    return res.status(400).json ( {
                    message: "field condition_value is required.",
                    status: "error",
                    data: null
                  })
}



    if (!(rule.condition==="eq" || rule.condition==="neq" || rule.condition==="gt" || rule.condition==="gte" || rule.condition==="contains")){
        return res.status(400).json ({
              message: "Values of the field condition should either be eq,neq,gt,gte or contains.",
              status: "error",
              data: null
            })
        }
   
//e
    if(!(typeof(data)==='object' || typeof(data)==='string' || (Array.isArray(data))) ){
        return res.status(400).json({
            message: "data should be either of a valid json object,an array or a string.",
            status: "error",
            data: null
          })
    }
      
if(typeof(rule.field!=='string')){
    rule.field=rule.field.toString()
}

    const ruleFieldData=rule.field
    const ruleFieldList= ruleFieldData.split('.')
    if(ruleFieldList.length>2){
        return res.status(400).json({
            message: "field field only supports two levels of nesting.",
            status: "error",
            data: null
        })
    }
    
    const fieldValue= _.getPath(data,rule.field)

    if(!fieldValue){
     return res.status(400).json({
         message: `field ${rule.field} is missing from data.`,
         status: "error",
         data: null
     })
    }
           const success= { message: `field ${rule.field} successfully validated.`,
        status: "success",
    data: {
          validation: {
            error: false,
            field: rule.field ,
            field_value: fieldValue,
            condition: rule.condition,
            condition_value: rule.condition_value
          }
        }}

        const error= { message: `field ${rule.field} failed validation.`,
        status: "error",
        data: {
          validation: {
            error: true,
            field: rule.field,
            field_value: fieldValue,
            condition: rule.condition,
            condition_value: rule.condition_value
          }
        }
    
        }

       if(rule.condition==='eq' && fieldValue===rule.condition_value){
        return res.status(200).json(success)
    } else if(rule.condition==='eq' && fieldValue!==rule.condition_value){
        return res.status(400).json(error)
    }else if(rule.condition==='neq' && fieldValue!==rule.condition_value){
        return res.status(200).json(success)
    }else if(rule.condition==='neq' && fieldValue===rule.condition_value){
        return res.status(400).json(error)
    }else if(rule.condition==='gt' && fieldValue>rule.condition_value){
        return res.status(200).json(success)
        }else if(rule.condition==='gt' && fieldValue<rule.condition_value){
            return res.status(400).json(error)
        }else if(rule.condition==='gte' && fieldValue>=rule.condition_value){
            return res.status(200).json(success)
        }else if(rule.condition==='gte' && !(fieldValue>=rule.condition_value)){
            return res.status(400).json(error)
        }else if(rule.condition==='contains' && Array.isArray(data) && data.includes(rule.condition_value)){
            success.data.validation.field_value=data
            return res.status(200).json(success)
        }else if(rule.condition==='contains' && Array.isArray(data) && !(data.includes(rule.condition_value))){
            error.data.validation.field_value=data
            return res.status(400).json(error)
        }   else if(rule.condition==='contains' && typeof(fieldValue)=='number'){
            error.data.validation.field_value=data
            return res.status(400).json(error)
        }  else if(rule.condition==='contains' && typeof(fieldValue)=='string' && fieldValue.includes(rule.condition_value)){
            success.data.validation.field_value=data
            return res.status(200).json(success)
        }  else if(rule.condition==='contains' && typeof(fieldValue)=='string' && !(fieldValue.includes(rule.condition_value))){
            error.data.validation.field_value=data
            return res.status(400).json(error)
        }       
   

        if(ruleFieldList.length==1){
            const fieldD=Number(ruleFieldList)

            if(fieldD!==NaN && typeof(data)=="string"){
                
                
                if(rule.condition==='eq' && data.indexOf(rule.condition_value)===rule.condition_value){
                    return res.status(200).json(success)
                }else if(rule.condition==='eq' && data.indexOf(rule.condition_value)!==fieldD){
                    return res.status(400).json(error)
                }else if(rule.condition==='neq' && data.indexOf(rule.condition_value)!==fieldD){
                    return res.status(200).json(success)
                }else if(rule.condition==='neq' && data.indexOf(rule.condition_value)==fieldD){
                    return res.status(400).json(error)
                }else if(rule.condition==='gt' && data.charAt(fieldD)>rule.condition_value){
                    return res.status(200).json(success)
                }else if(rule.condition==='gt' && !(data.charAt(fieldD)>rule.condition_value)){
                    return res.status(400).json(error)
                }else if(rule.condition==='gte' && data.charAt(fieldD)>=rule.condition_value){
                    return res.status(200).json(success)
                }else if(rule.condition==='gte' && !(data.charAt(fieldD)>=rule.condition_value)){
                    return res.status(400).json(error)
                }else if(rule.condition==='contains' && data.includes(rule.condition_value)){
                    return res.status(200).json(success)
                }else if(rule.condition==='contains' && !(data.includes(rule.condition_value))){
                    return res.status(400).json(error)
                }
            }
            if(fieldD!==NaN && Array.isArray(data)){
const nthElement = (arr, n = 0) => (n > 0 ? arr.slice(n, n + 1) : arr.slice(n))[0];
                if(rule.condition==='eq' && nthElement(data, fieldD)===rule.condition_value){
                    success.data.validation.field_value=data
                    return res.status(200).json(success)
                }else if(rule.condition==='eq' && nthElement(data, fieldD)!==rule.condition_value){
                    error.data.validation.field_value=data
                    return res.status(400).json(error)
                }else if(rule.condition==='neq' && nthElement(data, fieldD)!==rule.condition_value){
                    success.data.validation.field_value=data
                    return res.status(200).json(success)
                }else if(rule.condition==='neq' && nthElement(data, fieldD)===rule.condition_value){
                    error.data.validation.field_value=data
                    return res.status(400).json(error)
                }else if(rule.condition==='gt' && nthElement(data, fieldD)>rule.condition_value){
                    success.data.validation.field_value=data
                    return res.status(200).json(success)
                }else if(rule.condition==='gt' && !(nthElement(data, fieldD)>rule.condition_value)){
                    error.data.validation.field_value=data
                    return res.status(400).json(error)
                }else if(rule.condition==='gte' && nthElement(data, fieldD)>=rule.condition_value){
                    success.data.validation.field_value=data
                    return res.status(200).json(success)
                }else if(rule.condition==='gte' && !(nthElement(data, fieldD)>=rule.condition_value)){
                    error.data.validation.field_value=data
                    return res.status(400).json(error)
                 }else if(rule.condition==='contains' && data.includes(rule.condition_value)){
                    success.data.validation.field_value=data
                    return res.status(200).json(success)
                }else if(rule.condition==='contains' && !(data.includes(rule.condition_value))){
                    error.data.validation.field_value=data
                   return  res.status(400).json(error)
                }
            }

        }   
            
        



})


app.listen( (process.env.PORT || 3000),()=>{
    console.log("App is live");
})



    




