
// const http = require('http');

// const server=http.createServer((req,res)=>{
//    res.writeHead(400,{'content-type':'text/plain'});
//    res.end("Hello from my Server");
// });

// server.listen(8000,()=>{
//     console.log("Server running at http://localhost:8000");
// });

require("dotenv").config();

const connectDB=require("./config/db");
const express=require('express');
const cors=require('cors')

const postRoutes=require('./routes/postRoutes.js');
const userRoutes=require('./routes/userRoutes.js');

const app=express();
connectDB();

app.use(express.json())
app.use(cors())

app.get('/', (req,res)=>{
    res.json({message: "Welcome to the Social Media API"});
});

app.get('/health', (req,res)=>{
    res.status(200).json({
        message:"Working Wonderfully"
    });
})


app.get('/users', (req,res)=>{
    res.json({users:[{id:1, name:'A'}, {id:2, name:'B'}]})
}); 

app.post('/posts',(req,res)=>{
    console.log(req.body)

    res.status(201).json({
        message:"Requested Successfully", 
        post:req.body 
    });
})

app.use('/api/posts',postRoutes);
app.use('/api/users', userRoutes)


app.use((req,res)=>{
    res.status(400).json({error:"Bad Request"});
})

const PORT=process.env.PORT || 3000

app.listen(3000, ()=>{
    console.log(`Server working on http://localhost:${PORT}`)
});
