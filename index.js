const express = require('express');
const app = express();
const dfff = require('dialogflow-fulfillment');
var admin = require("firebase-admin");

var serviceAccount = require("./config/devbot-84974-firebase-adminsdk-pm41h-4a5870d01f.json");

try{
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://devbot-84974.firebaseio.com"
      })
}
catch(error){
    console.log("error here"+console.error);

}

var db =admin.firestore();


const { response } = require('express');
app.get('/',(req,res)=>{
    res.send("we are live")
});
app.post('/',express.json(),(req,res)=>{
    const agent = new dfff.WebhookClient({
        request :req,
        response:res
 
    });
    function demo(agent){
        agent.add("sending response from webhook server");
    }
    function customPayloadDemo(agent){
        var payloadData = {
            "richContent": [
              [
                {
                  "type": "accordion",
                  "title": "Accordion title",
                  "subtitle": "Accordion subtitle",
                  "image": {
                    "src": {
                      "rawUrl": "https://example.com/images/logo.png"
                    }
                  },
                  "text": "Accordion text"
                }
              ]
            ]
          }

          agent.add( new dfff.Payload(agent.UNSPECIFIED, payloadData, {sendAsMessage: true, rawPayload: true }))
    }

    function finalConfirmation(agent){
        var name = agent.context.get("awaiting_name").parameters['given-name'];
        var email = agent.context.get("awaiting_email").parameters.email;
  
        console.log(name);
        console.log(email);
  
  
        
  
        agent.add(`Hello ${name}, your email: ${email}. We confirmed your meeting.`);
  
        return db.collection('meeting').add({
          name : name,
          email : email,
          time : Date.now()
        }).then(ref =>
  
          //fetching free slots from G-cal
          console.log("Meeting details added to DB")
          )
  
      }




    var intentMap = new Map();
    intentMap.set('finalConfirmation', finalConfirmation)
    intentMap.set('webhookDemo',demo)
    intentMap.set('customPayloadDemo', customPayloadDemo)
    
    agent.handleRequest(intentMap);

});

app.listen(3333,()=>console.log("server is live at port 3333"));