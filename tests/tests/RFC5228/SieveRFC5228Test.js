"use strict";
  
(function() {

  var suite  = net.tschmid.yautt.test;
    
  if (!suite)
    throw "Could not initialize test suite";

  suite.add( function() {  	
  	suite.log("RFC5228 unit tests...")
  });    

  function testScript(script, capabilities) {     
  	
  	if (capabilities)
  	  SieveLexer.capabilities(capabilities);
  	
  	
    var doc = new SieveDocument(SieveLexer,null);
    
    suite.logTrace("Start Parsing Script");
    doc.script(script);
    suite.logTrace("End Parsing Script");
    
    suite.logTrace("Start Serializing Script");
    var rv = doc.script();
    suite.logTrace("End Serializing Script");
  
    suite.assertEquals(script, rv);

    if (capabilities) {
      var requires = {};      
      doc.root().require(requires);
      
      suite.logTrace(rv);
      
      for (var capability in capabilities) {
      	suite.logTrace("Testing Capability: "+capability);
        suite.assertEquals(true, requires[capability]);
      }
    }
    
  
    return doc;
  }

  suite.add( function() {
    suite.log("Single line comment");
  
    var script = ""
      + 'if size :over 100k { # this is a comment\r\n'
      + '    discard;\r\n'
      + '}\r\n';
                  
    testScript(script); 
  });


  suite.add( function() {
    suite.log("Multiline comment");
 
    var script = "" 
      + 'if size :over 100K { /* this is a comment\r\n'
      + '    this is still a comment */ discard /* this is a comment\r\n'
      + '     */ ;\r\n'
      + '}\r\n';
      
    testScript(script);
  });


  suite.add( function() {
    suite.log("Example 1");
  
    var script = "" 
      + 'if anyof (not exists ["From", "Date"],\r\n'
      + '          header :contains "from" "fool@example.com") {\r\n'
      + '  discard;\r\n'
      + '}\r\n'   
      
    testScript(script);	
  });
  
  suite.add( function() {
    suite.log("Example 2");
  
    var script = ""  
      + 'if header :comparator "i;octet" :contains "Subject"\r\n'
      + '             "MAKE MONEY FAST" {\r\n'
      + '          discard;\r\n'
      + '}\r\n';
      
    testScript(script);	
  });  

  suite.add( function() {
    suite.log("Example 3");
  
    var script =  
      'if size :over 500K { discard; }';
      
    testScript(script);	
  });  
  
  suite.add( function() {
    suite.log("Example 4");
  
    var script = ""  
          + 'if header :contains ["From"] ["coyote"] {\r\n'
          + '   redirect "acm@example.com";\r\n'
          + '} elsif header :contains "Subject" "$$$" {\r\n'
          + '   redirect "postmaster@example.com";\r\n'
          + '} else {\r\n'
          + '   redirect "field@example.com";\r\n'
          + '}\r\n';
      
    testScript(script);	
  });  
  
  suite.add( function() {
    suite.log("Example 5");
  
    var script = ""  
          + 'require "fileinto";\r\n'
          + 'if header :contains "from" "coyote" {\r\n'
          + '   discard;\r\n'
          +  '} elsif header :contains ["subject"] ["$$$"] {\r\n'
          +  '   discard;\r\n'
          +  '} else {\r\n'
          +  '   fileinto "INBOX";\r\n'
          +  '}\r\n'
      
    testScript(script, {"fileinto":true});	
  });   
  
  suite.add( function() {
    suite.log("Example 6");
  
    var script = ""
          + 'require "fileinto";\r\n'
          + 'if header :contains ["from"] "coyote" {\r\n'
          + '   fileinto "INBOX.harassment";\r\n'
          + '}\r\n';
      
    testScript(script, {"fileinto":true});	
  });   
  
  suite.add( function() {
    suite.log("Example 7");
  
    var script = ""
          + 'if size :under 1M { keep; } else { discard; }';
      
    testScript(script);	
  });    
  
  suite.add( function() {
    suite.log("Example 8");
  
    var script = ""
          + 'if not size :under 1M { discard; }';
      
    testScript(script);	
  }); 
  
  suite.add( function() {
    suite.log("Example 9");
  
    var script = ""
          + 'if header :contains ["from"] ["idiot@example.com"] {\r\n'
          + '   discard;\r\n'
          + '}\r\n';
      
    testScript(script);	
  });  
  
  suite.add( function() {
    suite.log("Example 10");
  
    var script = ""
          + 'if address :all :is "from" "tim@example.com" {\r\n'
          + '   discard;\r\n'
          + '}\r\n';
          
    testScript(script);	
  });  
  
  suite.add( function() {
    suite.log("Example 11");
  
    var script = ""
          + 'require "envelope";\r\n'
          + 'if envelope :all :is "from" "tim@example.com" {\r\n'
          + '   discard;\r\n'
          + '}\r\n'; 
              
    testScript(script,{"envelope":true});	
  }); 
  
  suite.add( function() {
    suite.log("Example 12");
  
    var script = ""
          + 'if not exists ["From","Date"] {\r\n'
          + '   discard;\r\n'
          + '}\r\n';
              
    testScript(script);	
  });  
  
  suite.add( function() {
    suite.log("Example Sieve Filter");
  
    var script = ""
          + '#\r\n'
          + '# Example Sieve Filter\r\n'
          + '# Declare any optional features or extension used by the script\r\n'
          + '#\r\n'
          + 'require ["fileinto"];\r\n'
          + '\r\n'
          + '#\r\n'
          + '# Handle messages from known mailing lists\r\n'
          + '# Move messages from IETF filter discussion list to filter mailbox\r\n'
          + '#\r\n'
          + 'if header :is "Sender" "owner-ietf-mta-filters@imc.org"\r\n'
          + '        {\r\n'
          + '        fileinto "filter";  # move to "filter" mailbox\r\n'
          + '        }\r\n'
          + '#\r\n'
          + '# Keep all messages to or from people in my company\r\n'
          + '#\r\n'
          + 'elsif address :domain :is ["From", "To"] "example.com"\r\n'
          + '        {\r\n'
          + '        keep;               # keep in "In" mailbox\r\n'
          + '        }\r\n'
          + '\r\n'
          + '#\r\n'
          + '# Try and catch unsolicited email.  If a message is not to me,\r\n'
          + '# or it contains a subject known to be spam, file it away.\r\n'
          + '#\r\n'
          + 'elsif anyof (not address :all :contains\r\n'
          + '               ["To", "Cc", "Bcc"] "me@example.com",\r\n'
          + '             header :matches "subject"\r\n'
          + '               ["*make*money*fast*", "*university*dipl*mas*"])\r\n'
          + '        {\r\n'
          + '        fileinto "spam";   # move to "spam" mailbox\r\n'
          + '        }\r\n'
          + 'else\r\n'
          + '        {\r\n'
          + '        # Move all other (non-company) mail to "personal"\r\n'
          + '        # mailbox.\r\n'
          + '        fileinto "personal";\r\n'
          + '        }\r\n';
              
    testScript(script, {"fileinto":true});	
  });    
  
  


}());

