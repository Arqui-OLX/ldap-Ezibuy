const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ldap = require('ldapjs');

const ldapClientAdmin = ldap.createClient({
    url: 'ldap://35.208.241.159:389',
    ejectUnauthorized: false,
	requestCert: true
});

const ldapClient = ldap.createClient({
    url: 'ldap://35.208.241.159:389',
    ejectUnauthorized: false,
	requestCert: true
})

ldapClientAdmin.bind('cn=admin,dc=ezibuy,dc=com,dc=co', 'password', function(err) {
    if(!err)
        console.log("Succesfully connected to LDAP server")
    else
        console.error("Error connecting to LDAP server")
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/login', function (req, res) {
    const dn = `cn=${req.body.email},ou=ezibuyteam,dc=ezibuy,dc=com,dc=co`;
    const password = req.body.password;

    ldapClient.bind(dn, password, function(err) {
        if(!err)
            res.status(200).send(true);
        else
            res.status(200).send(false);
    });
})

app.post('/insert', function (req, res) {
    const dn = `cn=${req.body.email},ou=ezibuyteam,dc=ezibuy,dc=com,dc=co`;
    const password = req.body.password;

    const entry = {
        cn: req.body.email,
        sn: 'bar',
        objectclass: 'inetOrgPerson',
        userPassword: password
    };
    
    ldapClientAdmin.add(dn, entry, function(err){
        if(!err){
            res.status(200).send(true);
        } else {
            res.status(200).send(false); 
            
         }
    })
})

app.post('/modify_password', function (req, res) {
    const dn = `cn=${req.body.email},ou=ezibuyteam,dc=ezibuy,dc=com,dc=co`;
    const password = req.body.newPassword;

    const change = new ldap.Change({
        operation: 'replace',
        modification: {
            userPassword: password
        }
    });

    ldapClientAdmin.modify(dn, change, function(err){
        if(!err)
            res.status(200).send(true);
        else
            res.status(200).send(false);
    });

})

app.get('/exists', function(req,response) {
    const dn = `cn=${req.body.email},ou=ezibuyteam,dc=ezibuy,dc=com,dc=co`;

    ldapClientAdmin.search(dn, dn, function(err, res){
        
          res.on('error', function(err) {
            response.status(200).send(false);
          });
          res.on('end', function(result) {
            response.status(200).send(true);
          });
    });
})

app.use((req, res) => {
    res.status(404).send({
        error: "invalid route"
    })
});



module.exports = app;
