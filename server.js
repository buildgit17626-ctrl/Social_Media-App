
// const http = require('http');

// const server=http.createServer((req,res)=>{
//    res.writeHead(400,{'content-type':'text/plain'});
//    res.end("Hello from my Server");
// });

// server.listen(8000,()=>{
//     console.log("Server running at http://localhost:8000");
// });

const express=require('express');
const app=express();


app.use(express.json)
app.use((req,res,next)=>{
    console.log(req.method,req.url)
    next();
})

app.get('/', (req,res)=>{
    res.json({message: "Welcome to the Social Media API"});
});

app.get('/posts/', (req,res)=>{
    res.json({
        posts:[{id:1, content:'First Post'}, {id:2, content:'Learning'}]
    });
});

app.get('/users', (req,res)=>{
    res.json({users:[{id:1, name:'A'}, {id:2, name:'B'}]})
}); 


app.use((req,res)=>{
    res.status(400).json({error:"Bad Request"});
})

app.listen(3000, ()=>{
    console.log('Server working on http://localhost:3000')
});
