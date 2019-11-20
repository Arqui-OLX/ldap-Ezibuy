const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ldap = require('ldapjs');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const ldapConnectionOptions = {
    url: 'ldap://35.208.241.159:389',
    reconnect: true
}

app.post('/login', function (req, res) {

    let ldapClient = ldap.createClient(ldapConnectionOptions);

    const dn = `cn=${req.body.email},ou=ezibuyteam,dc=ezibuy,dc=com,dc=co`;
    const password = req.body.password;

    ldapClient.bind(dn, password, function(err) {
        if(!err) {
            res.status(200).send(true);
            ldapClient.unbind();
        }
        else
            res.status(200).send(false);
    });
})

app.post('/insert', function (req, res) {

    let ldapClient = ldap.createClient(ldapConnectionOptions);

    const dn = `cn=${req.body.email},ou=ezibuyteam,dc=ezibuy,dc=com,dc=co`;
    const password = req.body.password;

    const entry = {
        cn: req.body.email,
        sn: 'bar',
        objectclass: 'inetOrgPerson',
        userPassword: password
    };

    ldapClient.bind('cn=admin,dc=ezibuy,dc=com,dc=co', 'password', function(err) {
        if(!err) {
            ldapClient.add(dn, entry, function(err){
                if(!err)
                    res.status(200).send(true);
                else 
                    res.status(200).send(false); 
                    
                ldapClient.unbind();
            })
        }
        else
            res.status(200).send(false);
    });

    
})

app.post('/modify_password', function (req, res) {

    let ldapClient = ldap.createClient(ldapConnectionOptions);

    const dn = `cn=${req.body.email},ou=ezibuyteam,dc=ezibuy,dc=com,dc=co`;
    const password = req.body.newPassword;

    const change = new ldap.Change({
        operation: 'replace',
        modification: {
            userPassword: password
        }
    });


    ldapClient.bind('cn=admin,dc=ezibuy,dc=com,dc=co', 'password', function(err) {
        if(!err) {
            ldapClient.modify(dn, change, function(err){
                if(!err) 
                    res.status(200).send(true);
                     
                else 
                    res.status(200).send(false); 

                ldapClient.unbind();
            });
        }
        else
            res.status(200).send(false);
    });



})

app.get('/exists', function(req,response) {

    let ldapClient = ldap.createClient(ldapConnectionOptions);

    const dn = `cn=${req.body.email},ou=ezibuyteam,dc=ezibuy,dc=com,dc=co`;


    ldapClient.bind('cn=admin,dc=ezibuy,dc=com,dc=co', 'password', function(err) {
        if(!err) {
            ldapClient.search(dn, dn, function(err, res){
        
                res.on('error', function(err) {
                    
                  response.status(200).send(false);
                  ldapClient.unbind();
                });
                res.on('end', function(result) {
                  response.status(200).send(true);
                  ldapClient.unbind();
                });

                
          });
        }
        else {
            
            res.status(200).send(false); }
    });


})

app.use((req, res) => {
    res.status(404).send({
        error: "invalid route"
    })
});


module.exports = app;
