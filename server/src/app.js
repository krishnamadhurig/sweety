require('dotenv').config();
const express=require('express');
const cors=require('cors');

const app=express();

app.use(cors({origin:process.env.CLIENT_ORIGIN || 'http://localhost:5173'}));
app.use(express.json())

app.get('/health', (req,res)=>{
    res.json({status:'ok'})
});

app.use((req,res)=>{
    res.status(404).json({error:'Not found'});
});

app.use((err,req,res,next)=>{
    console.error(err);
    res.status(500).json({error: 'Something went wrong. Please try again.'});
});
module.exports=app;